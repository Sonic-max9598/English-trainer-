/* Smoke tests: node test.js (file storage, random port). With DATABASE_URL set, the same tests run against Postgres. */
const assert = require('assert'), os = require('os'), path = require('path'), fs = require('fs');
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ei-')), 'data.json');
Object.assign(process.env, { PORT: '0', ADMIN_PASSWORD: 'secret-pass', CLASS_CODE: 'Room7', DATA_FILE: tmp, ALLOWED_ORIGINS: 'https://sonic-max9598.github.io' });
const server = require('./server');

(async () => {
  await new Promise(r => server.listening ? r() : server.once('listening', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const auth = { Authorization: 'Basic ' + Buffer.from('admin:secret-pass').toString('base64') };
  const J = { 'Content-Type': 'application/json' };
  const sync = (body, h = {}) => fetch(base + '/api/sync', { method: 'POST', headers: { ...J, ...h }, body: JSON.stringify(body) });
  let r;

  r = await fetch(base + '/healthz'); assert.equal(r.status, 200);
  r = await fetch(base + '/admin'); assert.equal(r.status, 401, 'admin needs a password');
  r = await fetch(base + '/admin', { headers: { Authorization: 'Basic ' + Buffer.from('a:wrong').toString('base64') } }); assert.equal(r.status, 401);
  r = await fetch(base + '/admin', { headers: auth }); assert.equal(r.status, 200); assert.match(await r.text(), /Журнал класса/);

  r = await fetch(base + '/api/news', { headers: { Origin: 'https://sonic-max9598.github.io' } });
  assert.equal(r.headers.get('access-control-allow-origin'), 'https://sonic-max9598.github.io');
  assert.deepEqual((await r.json()).text, '');
  r = await fetch(base + '/api/news', { headers: { Origin: 'https://evil.example' } });
  assert.equal(r.headers.get('access-control-allow-origin'), null, 'other sites get no CORS');

  const data = { xp: 420, lv: 3, streak: 5, acc: 88, words: 40, tenses: 4, read: 2, junk: '<script>', days: { '2026-11-27': [10, 12], 'bad': [1, 1] } };
  r = await sync({ id: 'abcdef123456', name: 'Malika', code: 'nope', data }); assert.equal(r.status, 403, 'wrong class code');
  r = await sync({ id: 'x', name: 'Malika', code: 'room7', data }); assert.equal(r.status, 400, 'bad id');
  r = await sync({ id: 'abcdef123456', name: '  ', code: 'room7', data }); assert.equal(r.status, 400, 'empty name');
  r = await sync({ id: 'abcdef123456', name: ' Malika  <b>K</b> ', code: 'room7', data }); assert.equal(r.status, 200);
  r = await fetch(base + '/api/sync', { method: 'POST', headers: J, body: '{bad' }); assert.equal(r.status, 400);
  r = await fetch(base + '/api/sync', { method: 'POST', headers: J, body: 'x'.repeat(40000) }); assert.equal(r.status, 413);

  r = await fetch(base + '/admin/api/students', { headers: { ...auth, 'X-Admin': '1' } });
  const st = (await r.json()).students; assert.equal(st.length, 1);
  assert.equal(st[0].name, 'Malika bK/b', 'angle brackets stripped');
  assert.equal(st[0].data.xp, 420); assert.equal(st[0].data.junk, undefined); assert.deepEqual(Object.keys(st[0].data.days), ['2026-11-27']);

  r = await fetch(base + '/admin/api/news', { method: 'PUT', headers: { ...auth, ...J }, body: JSON.stringify({ text: 'hi' }) });
  assert.equal(r.status, 403, 'mutations need X-Admin header');
  r = await fetch(base + '/admin/api/news', { method: 'PUT', headers: { ...auth, ...J, 'X-Admin': '1' }, body: JSON.stringify({ text: 'Homework: Present Perfect' }) });
  assert.equal(r.status, 200);
  r = await fetch(base + '/api/news'); assert.equal((await r.json()).text, 'Homework: Present Perfect');

  r = await fetch(base + '/admin/api/students/abcdef123456', { method: 'DELETE', headers: { ...auth, 'X-Admin': '1' } }); assert.equal(r.status, 200);
  r = await fetch(base + '/admin/api/students', { headers: { ...auth, 'X-Admin': '1' } }); assert.equal((await r.json()).students.length, 0);
  r = await fetch(base + '/fonts/nunito-cyr.woff2'); assert.equal(r.status, 200); assert.equal(r.headers.get('content-type'), 'font/woff2');
  r = await fetch(base + '/fonts/../server.js'); assert.equal(r.status, 404);

  console.log('all server tests passed');
  server.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1) });
