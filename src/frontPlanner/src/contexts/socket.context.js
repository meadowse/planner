import { createContext } from 'react';
import io from 'socket.io-client';

export const socket = io(`https://10.199.254.28:3500/`);
export const SocketContext = createContext();
