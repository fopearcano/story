// Minimal mock of an OpenAI-compatible server (/v1/models and streaming
// /v1/chat/completions), standing in for OpenAI, OpenRouter, Ollama, LM Studio…
// Each POST is answered by the next scripted turn; requests are recorded.
import http from 'node:http';

const chunk = (res, delta, finish = null) => res.write(`data: ${JSON.stringify({ id: 'c1', object: 'chat.completion.chunk', choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`);

// A turn: { reasoning, text, tools: [{ name, args, id }], finish }, or
// { status, message } for an HTTP error, or { json: true, … } for a reply that
// ignores `stream` and comes back as one JSON object.
function writeTurn(res, turn, n) {
  const tools = (turn.tools || []).map((t, i) => ({ id: t.id ?? `call_${n}_${i}`, name: t.name, args: typeof t.args === 'string' ? t.args : JSON.stringify(t.args || {}) }));
  const finish = turn.finish || (tools.length ? 'tool_calls' : 'stop');
  if (turn.json) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ choices: [{ index: 0, finish_reason: finish, message: { role: 'assistant', content: turn.text || null, ...(tools.length && { tool_calls: tools.map((t) => ({ id: t.id, type: 'function', function: { name: t.name, arguments: t.args } })) }) } }] }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/event-stream' });
  res.write(': keep-alive\n\n');
  if (turn.reasoning) chunk(res, { reasoning_content: turn.reasoning });
  for (const piece of (turn.text || '').match(/.{1,10}/gs) || []) chunk(res, { content: piece });
  tools.forEach((t, i) => {
    chunk(res, { tool_calls: [{ index: i, id: t.id, type: 'function', function: { name: t.name, arguments: '' } }] });
    for (const piece of t.args.match(/.{1,12}/gs) || []) chunk(res, { tool_calls: [{ index: i, function: { arguments: piece } }] });
  });
  chunk(res, {}, finish);
  res.write('data: [DONE]\n\n');
  res.end();
}

export function startMockOpenAI(script, { models = ['model-b', 'model-a'] } = {}) {
  const requests = [];
  let n = 0;
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      const parsed = body ? JSON.parse(body) : {};
      requests.push({ method: req.method, url: req.url, headers: req.headers, body: parsed });
      if (req.method === 'GET' && req.url === '/v1/models') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ object: 'list', data: models.map((id) => ({ id, object: 'model' })) }));
        return;
      }
      if (req.url !== '/v1/chat/completions') { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: { message: 'not found' } })); return; }
      const turn = typeof script === 'function' ? script(parsed, n) : script[n];
      n++;
      if (!turn) { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: { message: 'mock script exhausted' } })); return; }
      if (turn.status) { res.writeHead(turn.status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: { message: turn.message || 'error', type: 'invalid_request_error' } })); return; }
      writeTurn(res, turn, n);
    });
  });
  const reset = () => { n = 0; requests.length = 0; };
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({
    server, requests, reset,
    chats: () => requests.filter((r) => r.url === '/v1/chat/completions'),
    url: `http://127.0.0.1:${server.address().port}`,
  })));
}
