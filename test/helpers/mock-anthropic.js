// Minimal mock of the Claude Messages API streaming endpoint, used to test the
// agent loop without network access or an API key. Each POST /v1/messages is
// answered by the next scripted turn; every request body is recorded.
import http from 'node:http';

function sse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// A turn is a list of blocks: { thinking }, { text }, { tool: { name, input } }.
function writeTurn(res, turn, n) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
  sse(res, 'message_start', { type: 'message_start', message: { id: `msg_${n}`, type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 } } });
  let stop = 'end_turn';
  turn.blocks.forEach((b, index) => {
    if (b.thinking !== undefined) {
      sse(res, 'content_block_start', { type: 'content_block_start', index, content_block: { type: 'thinking', thinking: '', signature: '' } });
      if (b.thinking) sse(res, 'content_block_delta', { type: 'content_block_delta', index, delta: { type: 'thinking_delta', thinking: b.thinking } });
      sse(res, 'content_block_delta', { type: 'content_block_delta', index, delta: { type: 'signature_delta', signature: `sig_${n}_${index}` } });
    } else if (b.text !== undefined) {
      sse(res, 'content_block_start', { type: 'content_block_start', index, content_block: { type: 'text', text: '' } });
      for (const chunk of b.text.match(/.{1,12}/gs) || []) sse(res, 'content_block_delta', { type: 'content_block_delta', index, delta: { type: 'text_delta', text: chunk } });
    } else if (b.tool) {
      stop = 'tool_use';
      sse(res, 'content_block_start', { type: 'content_block_start', index, content_block: { type: 'tool_use', id: `toolu_${n}_${index}`, name: b.tool.name, input: {} } });
      const json = b.raw ?? JSON.stringify(b.tool.input || {});
      for (const chunk of json.match(/.{1,16}/gs) || []) sse(res, 'content_block_delta', { type: 'content_block_delta', index, delta: { type: 'input_json_delta', partial_json: chunk } });
    }
    sse(res, 'content_block_stop', { type: 'content_block_stop', index });
  });
  sse(res, 'message_delta', { type: 'message_delta', delta: { stop_reason: turn.stop || stop, stop_sequence: null }, usage: { output_tokens: 42 } });
  sse(res, 'message_stop', { type: 'message_stop' });
  res.end();
}

export function startMockAnthropic(script) {
  const requests = [];
  let n = 0;
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      const parsed = body ? JSON.parse(body) : {};
      requests.push({ url: req.url, headers: req.headers, body: parsed });
      const turn = typeof script === 'function' ? script(parsed, n) : script[n];
      n++;
      if (!turn) { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ type: 'error', error: { type: 'api_error', message: 'mock script exhausted' } })); return; }
      if (turn.status) { res.writeHead(turn.status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ type: 'error', error: { type: turn.errorType || 'api_error', message: turn.message || 'error' } })); return; }
      writeTurn(res, turn, n);
    });
  });
  const reset = () => { n = 0; requests.length = 0; };
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, requests, reset, url: `http://127.0.0.1:${server.address().port}` })));
}
