import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../pages/_app';
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

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/messages?page=1&limit=50`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
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
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((message) => (
          <div 
            key={message.id}
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
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}