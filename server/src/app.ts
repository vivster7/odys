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

io.on('connection', (socket: socket.Socket) => {
  const query = socket.handshake.query;
  const roomId = query.roomId;

  console.log('client connected', socket.id);
  socket.join(roomId);

  const broadcastToRoom = (eventName: string, data: any) => {
    console.log(`broadcast to room ${roomId}: ${eventName}`);
    socket.to(roomId).broadcast.emit(eventName, data);
  };

  broadcastToRoom('playerConnected', { id: socket.id });

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

  socket.on('drawingSelected', (data) => {
    broadcastToRoom('drawingSelected', data);
  });

  socket.on('disconnect', () => {
    broadcastToRoom('playerDisconnected', { id: socket.id });
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
