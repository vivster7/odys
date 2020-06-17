require('dotenv').config();

import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import socket from 'socket.io';
import path from 'path';
import helmet from 'helmet';
import players from './players';

const { PORT } = process.env;
const index = require('./routes/index');
const status = require('./routes/status');

const app: express.Application = express();

app.use(cors());
app.use(helmet()); // add some HTTP headers for security
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, './../build/client')));

app.use(index);
app.use(status);

// catch all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + './../build/client/index.html'));
});

const server = require('http').createServer(app);
const io = socket(server);

io.use((socket, next) => {
  const { roomId = '', currentPlayerId = '' } = socket.handshake.query;
  if (!roomId) {
    return next(new Error('Handshake did not specify room to join'));
  }
  if (!currentPlayerId) {
    return next(new Error('Handshake did not specify currentPlayerId'));
  }

  return next();
});

const connectExistingPlayersToSender = (
  socket: socket.Socket,
  roomId: string
) => {
  io.sockets.in(roomId).clients((err: any, clients: string[]) => {
    const otherPlayers = clients
      .filter((id) => id !== socket.id && players.get(roomId, id).id)
      .map((id) => players.get(roomId, id));

    if (otherPlayers.length) {
      console.log(`connecting existing players ${otherPlayers}`);
      socket.emit('playersConnected', otherPlayers);
    }
  });
};

io.on('connection', (socket: socket.Socket) => {
  const query = socket.handshake.query;
  const { roomId, currentPlayerId } = query;

  console.log(`client connected ${currentPlayerId} (${socket.id})`);
  socket.join(roomId);

  players.connect(roomId, socket.id, currentPlayerId);

  const broadcastToRoom = (eventName: string, data: any) => {
    // console.log(`broadcast to room ${roomId}: ${eventName}`);
    socket.to(roomId).broadcast.emit(eventName, data);
  };

  broadcastToRoom('playersConnected', [players.get(roomId, socket.id)]);
  connectExistingPlayersToSender(socket, roomId);

  socket.on('disconnect', () => {
    broadcastToRoom('playerDisconnected', players.get(roomId, socket.id));
    players.disconnect(roomId, socket.id);
  });

  const registerClientEvents = () => {
    /**
      drawing events emitted from client pass through this middleware that restructures
      packet of data sent to include `clientId`.
    */
    socket.use((packet, next) => {
      packet[1] = {
        data: packet[1],
        playerId: players.get(roomId, socket.id).id,
      };
      next();
    });

    socket.on('updatedState', (data) => {
      broadcastToRoom('updatedState', data);
    });

    socket.on('cursorMoved', (data) => {
      broadcastToRoom('cursorMoved', data);
    });

    socket.on('selectBoxResize', (data) => {
      broadcastToRoom('selectBoxResize', data);
    });
  };

  registerClientEvents();
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
