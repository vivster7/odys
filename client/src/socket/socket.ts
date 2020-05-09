import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:3000';
const socket = io.connect(ENDPOINT);

export default socket;
