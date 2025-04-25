// test-ws.js
import { io } from 'socket.io-client';

// Replace this with the JWT you obtained from /auth/login
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIiwic3ViIjoiNjgwYmQ5NDkxMDk0MjcxNjY0OTYyNDQ4IiwiaWF0IjoxNzQ1NjExNTg3LCJleHAiOjE3NDU2OTc5ODd9.887-j4c3pyrPcVeTYdl5D-OMnpAN16LVPscfu8lnsfk';

async function main() {
  const socket = io('http://localhost:3000', {
    auth: { token: TOKEN },
    transports: ['websocket'],  // skip polling, go straight to WS
  });

  socket.on('connect', () => {
    console.log('✅ Connected as', socket.id);

    // Send a test message
    socket.emit('sendMessage', { text: 'Hello from Node client!' });
  });

  socket.on('newMessage', (msg) => {
    console.log('📨 newMessage event:', msg);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
  });

  socket.on('error', (err) => {
    console.error('⚠️ Server error event:', err);
  });

  // Optionally disconnect after a while
  setTimeout(() => {
    socket.close();
    console.log('🔌 Disconnected');
    process.exit(0);
  }, 5000);
}

main();