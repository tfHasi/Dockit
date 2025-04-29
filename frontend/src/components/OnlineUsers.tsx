import { useState, useEffect } from 'react';
import { getSocket } from '../lib/socket';
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
    const socket = getSocket();
    if (!socket) return;

    socket.emit('getOnlineUsers');
    socket.on('onlineUsers', (users: OnlineUser[]) => setOnlineUsers(users));
    socket.on('userTyping', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => 
      setTypingUsers(prev => ({ ...prev, [userId]: isTyping }))
    );

    return () => {
      socket.off('onlineUsers');
      socket.off('userTyping');
    };
  }, []);

  return (
    <div className="bg-gray-100 border-l border-gray-200 p-4 w-64">
      <h2 className="font-bold text-lg mb-4">Online Users ({onlineUsers.length})</h2>
      {onlineUsers.length === 0 ? (
        <p className="text-gray-500 text-sm">No users online</p>
      ) : (
        onlineUsers.map(u => (
          <div key={u.userId} className="flex items-center">
            <span className="font-medium">
              {u.userId === user?.userId ? 'You' : u.nickname}
            </span>
            {typingUsers[u.userId] && <span className="ml-2 text-xs">typing...</span>}
          </div>
        ))
      )}
    </div>
  );
}