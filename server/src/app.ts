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

io.on('connection', (socket: socket.Socket) => {
  console.log('new client connected');

  socket.on('client connected', () => {
    console.log(`client ${socket.client.id} emitted a connect event`);
    socket.broadcast.emit('other client connect', { id: socket.client.id });
  });

  socket.on('drawingChanged', (data) => {
    socket.broadcast.volatile.emit('drawingChanged', data);
  });

  socket.on('drawingSaved', (data) => {
    // TODO timestamp against drawingChanged
    socket.broadcast.emit('drawingSaved', data);
  });

  socket.on('drawingDeleted', (data) => {
    socket.broadcast.volatile.emit('drawingDeleted', data);
  });

  socket.on('disconnect', () => {
    console.log('client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
