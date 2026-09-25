/**
 * VOZX AI - Node.js Backend Server (Zero-Dependency)
 * Serves website static assets and handles POST /api/chat with OpenAI.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  }
}

loadEnv();

const PORT = parseInt(process.env.PORT || '5000', 10);
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function callOpenAI(messages, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: OPENAI_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 35000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: { error: { message: data } } });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // GET /api/health
  if (req.method === 'GET' && pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      service: 'VOZX AI Neural Core (Node.js)',
      has_api_key: Boolean(process.env.OPENAI_API_KEY),
      model: OPENAI_MODEL
    }));
    return;
  }

  // POST /api/chat
  if (req.method === 'POST' && pathname === '/api/chat') {
    const apiKey = (process.env.OPENAI_API_KEY || '').trim();

    // REQUIREMENT: If the API key is missing, show "AI service unavailable."
    if (!apiKey) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'AI service unavailable.',
        code: 'missing_api_key'
      }));
      return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const json = JSON.parse(body || '{}');
        const userMessage = (json.message || '').trim();
        const rawMessages = json.messages || [];
        const history = json.history || [];

        const systemPrompt = {
          role: 'system',
          content: 'You are VOZX AI, an advanced, intelligent, and visionary neural AI assistant ecosystem. You provide precise, insightful, and helpful answers across coding, research, writing, planning, and analysis. Be conversational, engaging, futuristic yet grounded. Format responses cleanly with Markdown when beneficial.'
        };

        const openaiMessages = [systemPrompt];

        if (Array.isArray(rawMessages) && rawMessages.length > 0) {
          rawMessages.forEach(m => {
            if (m && m.role && m.content) openaiMessages.push({ role: m.role, content: String(m.content) });
          });
        } else if (Array.isArray(history) && history.length > 0) {
          history.forEach(h => {
            if (h && h.role && h.content) openaiMessages.push({ role: h.role, content: String(h.content) });
          });
          if (userMessage) openaiMessages.push({ role: 'user', content: userMessage });
        } else if (userMessage) {
          openaiMessages.push({ role: 'user', content: userMessage });
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Please provide a message to chat with VOZX AI.' }));
          return;
        }

        const openAiResp = await callOpenAI(openaiMessages, apiKey);

        if (openAiResp.status === 200) {
          const reply = openAiResp.data?.choices?.[0]?.message?.content || '';
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            reply: reply,
            role: 'assistant',
            model: OPENAI_MODEL
          }));
        } else {
          const errDetail = openAiResp.data?.error?.message || 'OpenAI error';
          console.error(`[OpenAI Error ${openAiResp.status}]:`, errDetail);
          // REQUIREMENT: If the API request fails, show "Something went wrong. Please try again."
          res.writeHead(openAiResp.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Something went wrong. Please try again.',
            code: openAiResp.data?.error?.type || 'api_error',
            details: errDetail
          }));
        }
      } catch (err) {
        console.error('Server error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Something went wrong. Please try again.',
          code: 'server_error'
        }));
      }
    });
    return;
  }

  // Static File Serving
  let reqPath = pathname;
  if (reqPath === '/' || !reqPath) reqPath = '/index.html';
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(__dirname, safePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_MAP[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`VOZX AI Node Server running on http://127.0.0.1:${PORT}`);
});
