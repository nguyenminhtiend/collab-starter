import { WebSocket } from 'ws';

// Use a VALID UUID
const docId = '00000000-0000-0000-0000-000000000000';
// Connect to the WEB PROXY port (5173)
const url = `ws://localhost:5173/collaboration/${docId}`;
const origin = 'http://localhost:5173';

console.log(`Connecting to ${url} with Origin: ${origin}...`);

const ws = new WebSocket(url, {
  headers: {
    Origin: origin,
  },
});

ws.on('open', () => {
  console.log('Connected!');
  console.log('Waiting for snapshot/messages...');
});

ws.on('message', (data) => {
  console.log('Received message:', data.toString());
  console.log('Test PASSED: Server sent data via PROXY.');
  ws.close();
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('Connection error:', err.message);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`Disconnected. Code: ${code}, Reason: ${reason}`);
  if (code !== 1000) {
    console.error('Unexpected closure');
    process.exit(1);
  }
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('Timeout: No message received in 5s');
  process.exit(1);
}, 5000);
