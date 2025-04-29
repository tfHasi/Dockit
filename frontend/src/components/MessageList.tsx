import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../lib/socket';

interface Message {
  id: string;
  text: string;
  userId: string;
  nickname: string;
  createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/messages?page=1&limit=20`,
          { credentials: 'include' }
        );
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    const s = getSocket();
    if (s) setSocket(s);
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div key="no-messages" className="flex items-center justify-center h-full text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((message, index) => (
          <div
            key={message.id || `message-${index}-${Date.now()}`}
            className={`max-w-3/4 p-3 rounded-lg ${
              message.userId === user?.userId
                ? 'ml-auto bg-blue-500 text-white'
                : 'mr-auto bg-gray-200 text-gray-900'
            }`}
          >
            <div className="font-bold text-sm">
              {message.userId === user?.userId ? 'You' : message.nickname}
            </div>
            <div className="mt-1">{message.text}</div>
            <div className="text-xs mt-1 text-right">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))
      )}
      <div key="scroll-anchor" ref={messagesEndRef} />
    </div>
  );
}