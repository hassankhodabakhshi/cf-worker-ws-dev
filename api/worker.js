const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// تنظیمات اصلی
const TARGET_DOMAIN = process.env.TARGET_DOMAIN || 'https://example.com';
const WS_ENDPOINT = process.env.WS_ENDPOINT || 'wss://example.com/ws';

// هندل کردن درخواست‌های HTTP
app.all('*', async (req, res) => {
  try {
    const url = new URL(req.path, TARGET_DOMAIN);
    const headers = { ...req.headers };
    delete headers.host;

    const response = await fetch(url.toString(), {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : null,
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    const text = await response.text();
    res.send(text);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// هندل کردن WebSocket (برای Vercel باید از Socket.io استفاده کرد)
app.get('/ws', (req, res) => {
  res.json({ 
    message: 'WebSocket endpoint',
    note: 'For full WebSocket support, consider using Socket.io',
    endpoint: WS_ENDPOINT
  });
});

// هندل کردن روت اصلی
app.get('/', (req, res) => {
  res.json({
    name: 'Cloudflare Worker Tunnel',
    version: '1.0.0',
    platform: 'Vercel',
    endpoints: {
      http: '/*',
      ws: '/ws',
      status: '/health'
    }
  });
});

// بررسی سلامت
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// اجرا روی پورت مشخص
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
