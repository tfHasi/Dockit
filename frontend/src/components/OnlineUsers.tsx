import { useState, useEffect } from 'react';
import { getSocket, initSocket } from '../lib/socket';
import { useAuth } from '../context/AuthContext';

interface OnlineUser {
  userId: string;
  nickname: string;
}

export default function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    // Make sure socket is initialized and connected
    const socket = user ? initSocket() : getSocket();
    if (!socket) return;

    // Debug logs
    console.log('OnlineUsers component mounted, socket state:', socket.connected);

    // Handle online users updates
    const handleOnlineUsers = (users: OnlineUser[]) => {
      console.log('Received onlineUsers event:', users);
      setOnlineUsers(users);
    };

    // Handle typing status updates
    const handleUserTyping = (data: { userId: string; nickname: string; isTyping: boolean }) => {
      console.log('User typing event:', data);
      setTypingUsers(prev => ({
        ...prev,
        [data.userId]: data.isTyping
      }));

      // Auto-reset typing status after timeout
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [data.userId]: false
          }));
        }, 3000);
      }
    };

    // If socket is connected, request online users list explicitly
    if (socket.connected) {
      socket.emit('getOnlineUsers');
    }

    // Listen for reconnection to request users list again
    socket.on('connect', () => {
      console.log('Socket reconnected in OnlineUsers component');
      socket.emit('getOnlineUsers');
    });

    // Set up event listeners
    socket.on('onlineUsers', handleOnlineUsers);
    socket.on('userTyping', handleUserTyping);

    // Clean up listeners on unmount
    return () => {
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('userTyping', handleUserTyping);
      socket.off('connect');
    };
  }, [user]);

  return (
    <div className="bg-gray-100 border-l border-gray-200 p-4 w-64">
      <h2 className="font-bold text-lg mb-4">Online Users ({onlineUsers.length})</h2>
      <div className="space-y-2">
        {onlineUsers.length === 0 ? (
          <div className="text-gray-500 text-sm">No users online</div>
        ) : (
          onlineUsers.map((onlineUser) => (
            <div key={onlineUser.userId} className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="font-medium">
                {onlineUser.userId === user?.userId ? 'You' : onlineUser.nickname}
              </span>
              {typingUsers[onlineUser.userId] && (
                <span className="ml-2 text-xs text-gray-500">typing...</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}