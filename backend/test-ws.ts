import { io } from 'socket.io-client';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIiwic3ViIjoiNjgwYmQ5NDkxMDk0MjcxNjY0OTYyNDQ4Iiwibmlja25hbWUiOiJhbGljZSIsImlhdCI6MTc0NTYyODA0NSwiZXhwIjoxNzQ1NzE0NDQ1fQ.TedoQS3WapVZZT49pkrvesPJvh6CMYYiIVRaersHgZw';

async function main() {
  const socket = io('http://localhost:3000', {
    auth: { token: TOKEN },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('✅ Connected as', socket.id);

    // Send a test message
    socket.emit('sendMessage', { text: 'Hello from Node client!' });

    // Simulate typing
    setTimeout(() => {
      console.log('✍️ Emitting typing...');
      socket.emit('typing', { isTyping: true });
    }, 1000);
  });

  socket.on('newMessage', (msg) => {
    console.log('📨 newMessage event:', msg);
  });

  socket.on('onlineUsers', (users) => {
    console.log('🟢 Online users:', users);
  });

  socket.on('userTyping', (data) => {
    console.log('✍️ userTyping event:', data);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
  });

  socket.on('error', (err) => {
    console.error('⚠️ Server error event:', err);
  });

  // Auto disconnect after 5s
  setTimeout(() => {
    socket.close();
    console.log('🔌 Disconnected');
    process.exit(0);
  }, 5000);
}

main();