import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:3000';
const socket = io.connect(ENDPOINT);

export function registerSocketListener(event: string, onEvent: Function) {
  const emitter = socket.on(event, onEvent);
  return () => {
    emitter.off(event, onEvent);
  };
}

export default socket;
