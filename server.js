const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Default Connected Credentials for MeliPayamak
const DEFAULT_MELI_CONFIG = {
  apiKey: 'cc63e954690948d1914b1c1d48c2b323',
  from: '50004001378267',
  username: '989193378267',
  password: '3MQ4R2GC'
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // --- MeliPayamak Direct Console Sender (/api/send-melli-sms) ---
  if (req.url === '/api/send-melli-sms' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const apiKey = (payload.apiKey || DEFAULT_MELI_CONFIG.apiKey).trim();
        const from = (payload.from || DEFAULT_MELI_CONFIG.from).trim();
        const to = (payload.to || '').trim();
        const text = (payload.text || '').trim();

        if (!to || !text) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: 'شماره موبایل و متن پیامک الزامی است.' }));
          return;
        }

        const postData = JSON.stringify({
          from: from,
          to: to,
          text: text
        });

        console.log(`[MeliPayamak] Sending SMS from ${from} to ${to}`);

        const options = {
          hostname: 'console.melipayamak.com',
          port: 443,
          path: `/api/send/simple/${apiKey}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData, 'utf8')
          }
        };

        const melliReq = https.request(options, melliRes => {
          let melliData = '';
          melliRes.on('data', d => { melliData += d; });
          melliRes.on('end', () => {
            console.log(`[MeliPayamak] Response: ${melliRes.statusCode} - ${melliData}`);
            try {
              const parsed = JSON.parse(melliData);
              const isSuccess = (melliRes.statusCode === 200 && parsed.status === 'عملیات موفق') || !!parsed.recId;
              
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({
                success: isSuccess,
                recId: parsed.recId || '',
                statusText: parsed.status || '',
                statusCode: melliRes.statusCode,
                response: parsed
              }));
            } catch (e) {
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({
                success: melliRes.statusCode === 200,
                statusCode: melliRes.statusCode,
                raw: melliData
              }));
            }
          });
        });

        melliReq.on('error', err => {
          console.error('[MeliPayamak] Network Error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        });

        melliReq.write(postData, 'utf8');
        melliReq.end();
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'JSON نامعتبر' }));
      }
    });
    return;
  }

  // --- Static File Serving ---
  let reqUrl = req.url.split('?')[0];
  let filePath = path.join(__dirname, reqUrl === '/' ? 'index.html' : reqUrl);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
