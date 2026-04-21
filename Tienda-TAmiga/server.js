const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = __dirname;
const port = Number(process.env.PORT || 4173);
const webhookEvents = [];

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error('Payload demasiado grande'));
      }
    });

    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (_error) {
        reject(new Error('JSON inválido'));
      }
    });

    req.on('error', (error) => reject(error));
  });
}

const server = http.createServer((req, res) => {
  const requestPath = req.url.split('?')[0];

  if (req.method === 'POST' && requestPath === '/local-webhook/receive') {
    parseRequestBody(req)
      .then((payload) => {
        webhookEvents.unshift({
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          receivedAt: new Date().toISOString(),
          headers: req.headers,
          payload,
        });

        if (webhookEvents.length > 100) {
          webhookEvents.splice(100);
        }

        sendJson(res, 200, { ok: true });
      })
      .catch((error) => {
        sendJson(res, 400, { ok: false, error: error.message || 'Body inválido' });
      });
    return;
  }

  if (req.method === 'GET' && requestPath === '/local-webhook/events') {
    sendJson(res, 200, {
      count: webhookEvents.length,
      data: webhookEvents,
    });
    return;
  }

  if (req.method === 'POST' && requestPath === '/local-webhook/clear') {
    webhookEvents.splice(0, webhookEvents.length);
    sendJson(res, 200, { ok: true });
    return;
  }

  const safePath = requestPath === '/'
    ? '/index.html'
    : requestPath === '/admin'
      ? '/admin.html'
      : requestPath;
  const filePath = path.join(rootDir, safePath);
  const resolvedPath = path.normalize(filePath);

  if (!resolvedPath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acceso denegado');
    return;
  }

  const finalPath = fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()
    ? resolvedPath
    : path.join(rootDir, 'index.html');

  fs.readFile(finalPath, (error, data) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Error cargando la tienda demo');
      return;
    }

    const ext = path.extname(finalPath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`FrogMarket listo en http://localhost:${port}`);
  console.log(`Webhook local receiver: http://localhost:${port}/local-webhook/receive`);
});
