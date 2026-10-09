const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 3000);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b';
const ROOT = __dirname;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon'
};

function send(res, status, data, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
  res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
}
async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 32_000) throw new Error('Request too large. Please keep your message shorter.');
  }
  return raw ? JSON.parse(raw) : {};
}
async function getModelStatus() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(1800) });
    if (!response.ok) return { connected: false, modelReady: false };
    const data = await response.json();
    const models = (data.models || []).map(m => m.name);
    const modelReady = models.some(name => name === MODEL);
    return { connected: true, modelReady, model: MODEL, availableModels: models };
  } catch {
    return { connected: false, modelReady: false, model: MODEL, availableModels: [] };
  }
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  if (req.method === 'GET' && url.pathname === '/api/status') {
    return send(res, 200, await getModelStatus());
  }
  if (req.method === 'POST' && url.pathname === '/api/chat') {
    try {
      const body = await readJson(req);
      const userMessage = String(body.message || '').trim().slice(0, 4000);
      if (!userMessage) return send(res, 400, { error: 'Please enter a question first.' });
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          stream: false,
          messages: [
            { role: 'system', content: 'You are Verdant, a friendly, careful nature guide. Help people notice and learn about nature outdoors. Be concise, curious, and practical. Never claim certainty when species identification or local ecology is uncertain. Do not encourage touching, tasting, feeding, or disturbing wild plants or animals. For potentially poisonous species, advise observing from a distance and asking a qualified local expert. Do not invent local weather, locations, or current conditions. When useful, give one small screen-free observation task. Keep most answers under 180 words.' },
            { role: 'user', content: userMessage }
          ],
          options: { temperature: 0.7, num_predict: 260 }
        }), signal: AbortSignal.timeout(120000)
      });
      if (!response.ok) return send(res, 502, { error: `Ollama returned ${response.status}. Check that the model is installed and Ollama is running.` });
      const data = await response.json();
      return send(res, 200, { reply: data.message?.content || 'I could not form a response. Please try again.', model: data.model || MODEL });
    } catch (error) {
      const message = error.name === 'TimeoutError' || error.name === 'AbortError'
        ? 'The model took too long to respond. Try a shorter question or check your computer resources.'
        : error.message.includes('fetch failed')
          ? 'Cannot reach Ollama. Start Ollama and make sure the model has been downloaded.'
          : error.message || 'Something went wrong while contacting the local model.';
      return send(res, 502, { error: message });
    }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed.' });
  let pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = path.resolve(ROOT, `.${pathname}`);
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== path.join(ROOT, 'index.html')) return send(res, 403, { error: 'Forbidden.' });
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    res.end(data);
  });
});
server.listen(PORT, HOST, () => {
  console.log(`Verdant AI is running at http://${HOST}:${PORT}`);
  console.log(`Local model expected: ${MODEL}`);
  console.log('Keep this terminal open while using the app. Press Ctrl+C to stop.');
});
