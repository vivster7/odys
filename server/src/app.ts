require('dotenv').config();

import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import socket from 'socket.io';

const { PORT } = process.env;
const index = require('./routes/index');

const app: express.Application = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(index);

const server = require('http').createServer(app);
const io = socket(server);

io.use((socket, next) => {
  const roomId = socket.handshake.query?.roomId;
  if (roomId) {
    return next();
  }
  return next(new Error('Handshake did not specify room to join'));
});

const connectExistingPlayersToSender = (
  socket: socket.Socket,
  roomId: string
) => {
  io.sockets.in(roomId).clients((err, clients) => {
    clients = clients.filter((id) => id !== socket.id);
    if (clients.length) {
      console.log(`connecting existing players ${clients}`);
      socket.emit(
        'playersConnected',
        clients.map((id) => ({ id: id }))
      );
    }
  });
};

io.on('connection', (socket: socket.Socket) => {
  const query = socket.handshake.query;
  const roomId = query.roomId;

  console.log('client connected', socket.id);
  socket.join(roomId);

  const broadcastToRoom = (eventName: string, data: any) => {
    console.log(`broadcast to room ${roomId}: ${eventName}`);
    socket.to(roomId).broadcast.emit(eventName, data);
  };

  broadcastToRoom('playersConnected', [{ id: socket.id }]);
  connectExistingPlayersToSender(socket, roomId);

  socket.on('drawingChanged', (data) => {
    socket.to(roomId).broadcast.volatile.emit('drawingChanged', data);
  });

  socket.on('drawingSaved', (data) => {
    // TODO: potential race-condition with drawingChanged? (use timestamps)
    broadcastToRoom('drawingSaved', data);
  });

  socket.on('drawingDeleted', (data) => {
    broadcastToRoom('drawingDeleted', data);
  });

  socket.on('drawingSelected', (id) => {
    broadcastToRoom('drawingSelected', { id, playerId: socket.id });
  });

  socket.on('disconnect', () => {
    broadcastToRoom('playerDisconnected', { id: socket.id });
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
