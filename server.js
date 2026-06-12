'use strict';

const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT || 3002;
const API_PORT = process.env.API_PORT || 3003;
const API_PREFIX = process.env.API_PREFIX || 'vipstarcoin-api';
const NETWORK = process.env.NETWORK || 'livenet';

const API_BASE = `http://localhost:${API_PORT}`;

const app = express();
const server = http.createServer(app);

// --- socket.io プロキシ（WebSocket 対応）---
const socketProxy = createProxyMiddleware({
  target: API_BASE,
  changeOrigin: true,
  ws: true,
  logLevel: 'warn'
});
app.use('/socket.io', socketProxy);
// WebSocket upgrade を明示的にハンドル
server.on('upgrade', socketProxy.upgrade);

// --- API プロキシ ---
app.use(`/${API_PREFIX}`, createProxyMiddleware({
  target: API_BASE,
  changeOrigin: true,
  logLevel: 'warn'
}));

// --- index.html の書き換え ---
const pkg = require('./package.json');
let indexHTML = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
indexHTML = indexHTML
  .replace(/\{\{version\}\}/g, pkg.version)
  .replace(/window\.apiPrefix = '\/api'/,
    `window.apiPrefix = '/${API_PREFIX}'`)
  .replace(/window\.current_network = null/,
    `window.current_network = '${NETWORK}'`);

// --- 静的ファイル ---
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// --- SPA フォールバック ---
app.get('*', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    res.setHeader('Content-Type', 'text/html');
    res.send(indexHTML);
  }
});

server.listen(PORT, () => {
  console.log(`VIPSTARCOIN Explorer  : http://localhost:${PORT}`);
  console.log(`API proxy target      : ${API_BASE}/${API_PREFIX}`);
  console.log(`Network               : ${NETWORK}`);
});
