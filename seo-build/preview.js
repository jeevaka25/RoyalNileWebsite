/* Local preview server that mirrors vercel.json rewrites + clean URLs.
   Run from the project root:  node seo-build/preview.js
   Then open http://localhost:5050
   (This is for local preview only — not used in production.) */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 5050;

const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const rewrites = (vercel.rewrites || []).reduce((m, r) => { m[r.source.replace(/\/$/, '') || '/'] = r.destination; return m; }, {});

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4', '.ico': 'image/x-icon', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'text/plain' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  // stub the availability serverless function so the homepage button degrades gracefully
  if (req.url.startsWith('/api/availability')) {
    return send(res, 200, JSON.stringify({ results: [] }), 'application/json');
  }

  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  const noSlash = urlPath.replace(/\/$/, '') || '/';

  // 1) explicit rewrite match
  let target = rewrites[noSlash];

  // 2) otherwise resolve as a static file
  if (!target) {
    if (urlPath === '/') target = '/index.html';
    else target = urlPath;
  }

  let filePath = path.join(ROOT, target);
  // try as-is, then with .html, then directory index
  const candidates = [filePath, filePath + '.html', path.join(filePath, 'index.html')];
  const found = candidates.find((c) => { try { return fs.statSync(c).isFile(); } catch { return false; } });

  if (!found) return send(res, 404, 'Not found: ' + urlPath);
  const ext = path.extname(found).toLowerCase();
  fs.readFile(found, (err, data) => {
    if (err) return send(res, 500, 'Server error');
    send(res, 200, data, MIME[ext] || 'application/octet-stream');
  });
});

server.listen(PORT, () => {
  console.log('\n  Royal Nile Villas — local preview running');
  console.log('  → http://localhost:' + PORT + '\n');
  console.log('  Try:  /  ·  /hot-air-balloon-luxor  ·  /villas/nile-view-luxury-1  ·  /restaurant.html  ·  /sitemap.xml');
  console.log('  Stop with Ctrl+C\n');
});
