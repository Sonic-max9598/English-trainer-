/* English Intensive — admin server (Render web service, no framework).
   Public API for the app (CORS):  GET /api/news · POST /api/sync
   Admin (HTTP Basic, password from ADMIN_PASSWORD): GET /admin · /admin/api/*
   Env: PORT, ADMIN_PASSWORD, DATABASE_URL (Postgres, e.g. Neon; without it → server/data.json), CLASS_CODE (optional),
        ALLOWED_ORIGINS (comma list for the app; default * ), MAX_STUDENTS (default 2000). */
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const makeStore = require('./store');

const PORT = process.env.PORT != null && process.env.PORT !== '' ? +process.env.PORT : 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const CLASS_CODE = (process.env.CLASS_CODE || '').trim();
const ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
const MAX_STUDENTS = +process.env.MAX_STUDENTS || 2000;
const ADMIN_HTML = fs.readFileSync(path.join(__dirname, 'admin.html'));
const FONTS = path.join(__dirname, '..', 'fonts');
const store = makeStore();

/* ---------- helpers ---------- */
function send(res, code, body, headers = {}) {
  const isBuf = Buffer.isBuffer(body), isStr = typeof body === 'string';
  const data = isBuf || isStr ? body : JSON.stringify(body);
  res.writeHead(code, Object.assign({
    'Content-Type': isBuf || isStr ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store'
  }, headers));
  res.end(data);
}
function readJSON(req, limit = 32 * 1024) {
  return new Promise((ok, bad) => {
    let size = 0; const chunks = [];
    /* past the limit: keep draining (so the 413 reply reaches the client) but stop collecting */
    req.on('data', c => { size += c.length; if (size <= limit) chunks.push(c); else if (size > limit * 8) req.destroy() });
    req.on('end', () => { if (size > limit) return bad(Object.assign(new Error('too large'), { code: 413 })); try { ok(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')) } catch (e) { bad(Object.assign(new Error('bad json'), { code: 400 })) } });
    req.on('error', bad);
  });
}
const ip = req => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
/* fixed-window rate limit per key */
const hits = new Map();
function limited(key, max, ms) {
  const now = Date.now(); let h = hits.get(key);
  if (!h || now > h.t) { h = { n: 0, t: now + ms }; hits.set(key, h) }
  return ++h.n > max;
}
setInterval(() => { const now = Date.now(); for (const [k, h] of hits) if (now > h.t) hits.delete(k) }, 60000).unref();
const sha = s => crypto.createHash('sha256').update(String(s)).digest();
const same = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));

function cors(req, res) {
  const o = req.headers.origin;
  if (!o) return;
  if (ORIGINS.includes('*')) res.setHeader('Access-Control-Allow-Origin', '*');
  else if (ORIGINS.includes(o)) { res.setHeader('Access-Control-Allow-Origin', o); res.setHeader('Vary', 'Origin') }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/* ---------- what a student's app may send: known fields only, clamped ---------- */
const num = (v, max = 1e9) => Number.isFinite(+v) ? Math.max(0, Math.min(max, Math.round(+v))) : 0;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
function cleanData(d) {
  d = d && typeof d === 'object' ? d : {};
  const days = {};
  if (d.days && typeof d.days === 'object') {
    for (const k of Object.keys(d.days).filter(k => DATE.test(k)).sort().slice(-30)) {
      const v = d.days[k]; if (Array.isArray(v)) days[k] = [num(v[0], 1e5), num(v[1], 1e5)];
    }
  }
  return {
    v: String(d.v || '').slice(0, 16), ui: d.ui === 'uz' ? 'uz' : 'ru', today: DATE.test(d.today) ? d.today : null,
    xp: num(d.xp), lv: num(d.lv, 1000), streak: num(d.streak, 1e4), best: num(d.best, 1e4),
    lessons: num(d.lessons, 1e6), perfect: num(d.perfect, 1e6), acc: d.acc == null ? null : num(d.acc, 100),
    words: num(d.words, 1e5), wordsSeen: num(d.wordsSeen, 1e5), tenses: num(d.tenses, 12), read: num(d.read, 100),
    min: num(d.min, 1440), days
  };
}
const ID = /^[A-Za-z0-9_-]{8,64}$/;
const cleanName = s => String(s || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);

/* ---------- routes ---------- */
async function api(req, res, url) {
  cors(req, res);
  if (req.method === 'OPTIONS') return send(res, 204, '');
  if (url.pathname === '/api/news' && req.method === 'GET') {
    const n = (await store.get('news')) || { text: '', updated: null };
    return send(res, 200, { text: n.text || '', updated: n.updated || null, code: !!CLASS_CODE }, { 'Cache-Control': 'public, max-age=60' });
  }
  if (url.pathname === '/api/sync' && req.method === 'POST') {
    if (limited('s:' + ip(req), 30, 60000)) return send(res, 429, { error: 'rate' });
    const b = await readJSON(req);
    const id = String(b.id || ''), name = cleanName(b.name);
    if (!ID.test(id)) return send(res, 400, { error: 'id' });
    if (!name) return send(res, 400, { error: 'name' });
    if (CLASS_CODE && !same(String(b.code || '').trim().toLowerCase(), CLASS_CODE.toLowerCase())) return send(res, 403, { error: 'code' });
    if (!(await store.hasStudent(id)) && (await store.countStudents()) >= MAX_STUDENTS) return send(res, 507, { error: 'full' });
    await store.upsertStudent(id, name, cleanData(b.data));
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: 'not found' });
}

function authed(req, res) {
  if (!ADMIN_PASSWORD) { send(res, 503, 'Админка выключена: задайте переменную окружения ADMIN_PASSWORD на Render.'); return false }
  const key = 'a:' + ip(req);
  const h = hits.get(key);
  if (h && h.n >= 10 && Date.now() <= h.t) { send(res, 429, 'Слишком много неверных паролей. Подождите 15 минут.'); return false }
  const m = /^Basic (.+)$/.exec(req.headers.authorization || '');
  const pass = m ? Buffer.from(m[1], 'base64').toString('utf8').replace(/^[^:]*:/, '') : null;
  if (pass !== null && same(pass, ADMIN_PASSWORD)) return true;
  if (pass !== null) limited(key, 1e9, 15 * 60000);
  send(res, 401, 'Нужен пароль администратора.', { 'WWW-Authenticate': 'Basic realm="English Intensive admin", charset="UTF-8"' });
  return false;
}

async function admin(req, res, url) {
  if (!authed(req, res)) return;
  const p = url.pathname;
  if ((p === '/admin' || p === '/admin/') && req.method === 'GET') {
    return send(res, 200, ADMIN_HTML, {
      'Content-Type': 'text/html; charset=utf-8', 'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'"
    });
  }
  /* mutations need a JSON body or a custom header: a cross-site form cannot send either without CORS */
  if (req.method !== 'GET' && req.headers['x-admin'] !== '1') return send(res, 403, { error: 'header' });
  if (p === '/admin/api/students' && req.method === 'GET') {
    return send(res, 200, { students: await store.listStudents(), now: new Date().toISOString(), classCode: !!CLASS_CODE, storage: store.kind });
  }
  let m;
  if ((m = /^\/admin\/api\/students\/([A-Za-z0-9_-]{8,64})$/.exec(p)) && req.method === 'DELETE') {
    return send(res, (await store.deleteStudent(m[1])) ? 200 : 404, { ok: true });
  }
  if (p === '/admin/api/news' && req.method === 'GET') return send(res, 200, (await store.get('news')) || { text: '', updated: null });
  if (p === '/admin/api/news' && req.method === 'PUT') {
    const b = await readJSON(req, 8 * 1024);
    const text = String(b.text || '').replace(/\r/g, '').trim().slice(0, 1000);
    const n = { text, updated: text ? new Date().toISOString() : null };
    await store.set('news', n);
    return send(res, 200, n);
  }
  return send(res, 404, { error: 'not found' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname === '/healthz') return send(res, 200, { ok: true, storage: store.kind });
    if (url.pathname === '/') return send(res, 302, '', { Location: '/admin' });
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) return await admin(req, res, url);
    const f = /^\/fonts\/([a-z-]+\.woff2)$/.exec(url.pathname);
    if (f && req.method === 'GET') {
      return fs.readFile(path.join(FONTS, f[1]), (e, buf) => e ? send(res, 404, 'not found')
        : send(res, 200, buf, { 'Content-Type': 'font/woff2', 'Cache-Control': 'public, max-age=31536000, immutable' }));
    }
    send(res, 404, 'not found');
  } catch (e) {
    if (e.code === 400 || e.code === 413) return send(res, e.code, { error: e.message });
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: 'server' });
  }
});

store.init().then(() => {
  server.listen(PORT, () => console.log(`admin server on :${PORT} · storage: ${store.kind}${ADMIN_PASSWORD ? '' : ' · ADMIN_PASSWORD is not set, /admin is off'}`));
  if (store.kind === 'file' && process.env.RENDER) console.warn('DATABASE_URL is not set: data is kept in a file and will be lost on every restart. Add the Neon connection string in Render → Environment.');
}).catch(e => { console.error('storage init failed:', e.message); process.exit(1) });
const stop = () => server.close(() => store.close().finally(() => process.exit(0)));
process.on('SIGTERM', stop); process.on('SIGINT', stop);
module.exports = server;
