import io from 'socket.io-client';
import {
  registerSelf,
  unregisterSelf,
  CURRENT_PLAYER_ID,
} from 'modules/players/players.reducer';
import { OdysDispatch } from 'App';

export interface ClientEvent {
  playerId: string;
  data: any;
}

let socket: SocketIOClient.Socket;

export function connect(dispatch: OdysDispatch, roomId: string) {
  socket = io({
    query: { roomId: roomId, currentPlayerId: CURRENT_PLAYER_ID },
  });

  socket.on('connect', () => {
    dispatch(registerSelf());
  });

  socket.on('disconnect', () => {
    dispatch(unregisterSelf());
  });
}

export function emitEvent(eventName: string, data: any) {
  if (socket) {
    socket.emit(eventName, data);
  }
}

export function registerSocketListener(event: string, onEvent: Function) {
  const emitter = socket.on(event, onEvent);
  return () => {
    emitter.off(event, onEvent);
  };
}
