/* Storage: PostgreSQL when DATABASE_URL is set (Render), otherwise a JSON file (local runs, tests).
   Two things are kept: students {id, name, data, updated} and settings {key: value} (the announcement). */
const fs = require('fs'), path = require('path');

function fileStore(file) {
  let db = { students: {}, kv: {} };
  try { db = Object.assign(db, JSON.parse(fs.readFileSync(file, 'utf8'))) } catch (e) {}
  let timer = null;
  const flush = () => { const tmp = file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db)); fs.renameSync(tmp, file) };
  const save = () => { clearTimeout(timer); timer = setTimeout(flush, 200) };
  return {
    kind: 'file',
    async init() {},
    async upsertStudent(id, name, data) { db.students[id] = { id, name, data, updated: new Date().toISOString() }; save() },
    async countStudents() { return Object.keys(db.students).length },
    async hasStudent(id) { return !!db.students[id] },
    async listStudents() { return Object.values(db.students).sort((a, b) => b.updated.localeCompare(a.updated)) },
    async deleteStudent(id) { const had = !!db.students[id]; delete db.students[id]; save(); return had },
    async get(key) { return db.kv[key] ?? null },
    async set(key, value) { db.kv[key] = value; save() },
    async close() { clearTimeout(timer); flush() }
  };
}

function pgStore(url) {
  const { Pool } = require('pg');
  /* Neon (or any hosted Postgres): TLS with a verified certificate. SSL params are taken out of the URL
     because pg lets them override the ssl option below; channel binding is kept if the URL asked for it.
     PGSSL=0 — no TLS (local server), PGSSL=noverify — TLS without checking the certificate. */
  const u = new URL(url);
  const binding = u.searchParams.get('channel_binding') === 'require';
  for (const k of ['sslmode', 'channel_binding', 'uselibpqcompat', 'sslrootcert']) u.searchParams.delete(k);
  const local = ['localhost', '127.0.0.1', '::1', ''].includes(u.hostname);
  const ssl = local || process.env.PGSSL === '0' ? false : { rejectUnauthorized: process.env.PGSSL !== 'noverify', servername: u.hostname };
  const pool = new Pool({ connectionString: u.toString(), max: 5, ssl, enableChannelBinding: binding,
    connectionTimeoutMillis: 20000, idleTimeoutMillis: 30000 });
  /* Neon closes idle connections and sleeps when unused: an idle client error must not crash the server */
  pool.on('error', e => console.error('postgres idle client error:', e.message));
  const row = r => ({ id: r.id, name: r.name, data: r.data, updated: r.updated.toISOString() });
  return {
    kind: 'postgres',
    async init() {
      await pool.query(`create table if not exists students(id text primary key, name text not null, data jsonb not null, updated timestamptz not null default now());
        create table if not exists settings(key text primary key, value jsonb);`);
    },
    async upsertStudent(id, name, data) {
      await pool.query(`insert into students(id,name,data,updated) values($1,$2,$3,now())
        on conflict(id) do update set name=excluded.name, data=excluded.data, updated=now()`, [id, name, data]);
    },
    async countStudents() { return +(await pool.query('select count(*) n from students')).rows[0].n },
    async hasStudent(id) { return (await pool.query('select 1 from students where id=$1', [id])).rowCount > 0 },
    async listStudents() { return (await pool.query('select * from students order by updated desc')).rows.map(row) },
    async deleteStudent(id) { return (await pool.query('delete from students where id=$1', [id])).rowCount > 0 },
    async get(key) { const r = await pool.query('select value from settings where key=$1', [key]); return r.rowCount ? r.rows[0].value : null },
    async set(key, value) { await pool.query('insert into settings(key,value) values($1,$2) on conflict(key) do update set value=excluded.value', [key, JSON.stringify(value)]) },
    async close() { await pool.end() }
  };
}

module.exports = function makeStore() {
  return process.env.DATABASE_URL ? pgStore(process.env.DATABASE_URL)
    : fileStore(process.env.DATA_FILE || path.join(__dirname, 'data.json'));
};
