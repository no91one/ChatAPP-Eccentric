const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors =require('cors')
require('dotenv').config()
app.use(cors())
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const users = {}; // Store usernames with socket IDs

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

server.listen(PORT, () => {
  console.log('Server is running on port 3000');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('register', (username) => {
    const userId = uuidv4();
    users[socket.id] = { userId, username };
    socket.emit('registration-success', userId, username);
  });

  socket.on('group-chat-message', (message) => {
    io.emit('chat-message', users[socket.id].username, message);
  });

  socket.on('private-message', (recipientUserId, message) => {
    const senderUser = users[socket.id];
    const recipientSocketId = Object.keys(users).find(
      (socketId) => users[socketId].userId === recipientUserId
    );

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('private-message', senderUser.username, message);
    } else {
      socket.emit('private-message-error', 'Recipient is not online');
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    delete users[socket.id];
  });
});
