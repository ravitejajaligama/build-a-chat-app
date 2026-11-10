import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
  fs.readFile('./public/index.html', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Unable to load the chat application');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

const broadcast = message => {
  const serializedMessage = JSON.stringify(message);

  wss.clients.forEach(client => {
    client.send(serializedMessage);
  });
};

wss.on('connection', (socket, req) => {
  const username = new URL(req.url, "http://localhost").searchParams.get(
    "username",
  );

  broadcast({ type: 'system', text: `${username} joined` });

  socket.on('message', message => {
    const { username, text } = JSON.parse(message);
    broadcast({ type: 'chat', username, text });
  });

  socket.on('close', () => {
    broadcast({ type: 'system', text: `${username} left` });
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
