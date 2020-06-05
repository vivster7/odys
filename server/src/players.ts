interface Player {
  id: string;
  color: string;
}

interface PlayerMap {
  [socketId: string]: Player;
}

interface Rooms {
  [id: string]: PlayerMap;
}

const rooms: Rooms = {};

export function connect(
  roomId: string,
  socketId: string,
  playerId: string
): void {
  // clean up if socket id has changed (e.g reconnected)
  const players = rooms[roomId] || {};

  Object.keys(players).forEach((socketId) => {
    const player = get(roomId, socketId);
    if (player.id === playerId) {
      delete players[socketId];
    }
  });
  players[socketId] = {
    id: playerId,
    color: pickColor(roomId),
  };

  rooms[roomId] = players;
}

export function disconnect(roomId: string, socketId: string): void {
  if (!rooms[roomId]) {
    console.error(`Cannot find room ${roomId}`);
    return;
  }

  if (!rooms[roomId][socketId]) {
    console.error(`Cannot find player with socket ${socketId}`);
    return;
  }

  delete rooms[roomId][socketId];

  if (Object.keys(rooms[roomId]).length === 0) {
    delete rooms[roomId];
  }
}

export function get(roomId: string, socketId: string): Player {
  if (!rooms[roomId]) {
    console.error(`Could not find room ${roomId}`);
    return { id: '', color: '' };
  }

  if (!rooms[roomId][socketId]) {
    console.error(`Could not find player with socket id ${socketId}`);
    return { id: '', color: '' };
  }

  const players = rooms[roomId];
  return players[socketId];
}

export default {
  get,
  connect,
  disconnect,
};

/**
  https://flatuicolors.com
*/

const BRUSCHETTA_TOMATO = '#ff6348';
const UFO_GREEN = '#2ed573';
const ORANGE = '#ffa502';
const HELIOTROPE = '#e056fd';
const CLEAR_CHILL = '#1e90ff';
const LIGHT_SLATE_BLUE = '#7d5fff';
const YOUNG_SALMON = '#ffb8b8';
const MANDARIN_SORBET = '#ffaf40';
const BRIGHT_LILAC = '#cd84f1';
const KEPPEL = '#58B19F';
const SPIRO_DISCO_BALL = '#25CCF7';
const QUINCE_JELLY = '#ffbe76';

const PALETTE = [
  HELIOTROPE,
  QUINCE_JELLY,
  UFO_GREEN,
  CLEAR_CHILL,
  BRUSCHETTA_TOMATO,
  LIGHT_SLATE_BLUE,
  YOUNG_SALMON,
  MANDARIN_SORBET,
  SPIRO_DISCO_BALL,
  BRIGHT_LILAC,
  KEPPEL,
  ORANGE,
];

function pickColor(roomId: string): string {
  const defaultColor = PALETTE[0];
  const players = rooms[roomId];

  if (!players) {
    return defaultColor;
  }
  const used = Object.values(players).map((p) => p.color);
  const remaining = PALETTE.filter((c) => !used.includes(c));

  if (remaining.length === 0) {
    return defaultColor;
  }
  return remaining[0];
}
