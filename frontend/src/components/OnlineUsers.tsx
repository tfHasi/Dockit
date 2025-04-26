import { useState, useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { useAuth } from '../pages/_app';

interface OnlineUser {
  userId: string;
  nickname: string;
}

export default function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOnlineUsers = (users: OnlineUser[]) => {
      setOnlineUsers(users);
    };

    const handleUserTyping = (data: { userId: string; nickname: string; isTyping: boolean }) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.userId]: data.isTyping
      }));

      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [data.userId]: false
          }));
        }, 3000);
      }
    };

    socket.on('onlineUsers', handleOnlineUsers);
    socket.on('userTyping', handleUserTyping);

    return () => {
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('userTyping', handleUserTyping);
    };
  }, []);

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