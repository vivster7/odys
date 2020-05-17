import io from 'socket.io-client';

let socket: SocketIOClient.Socket;

export function connect(roomId: string) {
  socket = io({ query: { roomId: roomId } });

  socket.on('connected', () => {
    console.log('i am connected', socket.connected);
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
