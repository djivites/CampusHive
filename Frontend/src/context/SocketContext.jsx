import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && user._id) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      
      // Connect to the socket server
      socketRef.current = io(socketUrl);

      // Join user-specific notification room
      socketRef.current.emit('join_user', user._id);

      console.log(`Connected to global socket and joined room user_${user._id}`);

      // Setup reconnect behavior
      socketRef.current.on('connect', () => {
        socketRef.current.emit('join_user', user._id);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log('Global socket disconnected');
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socketRef = useContext(SocketContext);
  return socketRef ? socketRef.current : null;
};
