import { io, type Socket } from 'socket.io-client';
import { ENV } from '../config/env';

const baseUrl = ENV.apiUrl.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(baseUrl, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function connectSocket(token?: string) {
  const s = getSocket();
  if (token) {
    (s.auth as any) = { token };
  }
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
