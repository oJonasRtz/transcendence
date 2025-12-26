// Type definitions for api-gateway TypeScript files

import { Socket } from 'socket.io-client';

// Socket.io client type (available globally in browser via CDN)
declare const io: {
  (url: string, opts?: any): Socket;
};

// Chat user interface
interface chatUser {
  username: string;
  avatar?: string;
  socketId?: string;
}

// Make window properties available
interface Window {
  io: typeof io;
}
