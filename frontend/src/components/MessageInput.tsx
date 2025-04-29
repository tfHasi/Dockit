import { useState, useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MessageInput() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !user) return;

    const socket = getSocket();
    if (!socket) {
      console.error('Socket not connected');
      return;
    }

    setIsSending(true);

    try {
      console.log(`Sending message as user: ${user.userId} (${user.nickname})`);
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: message.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    let typingTimeout: NodeJS.Timeout | null = null;

    if (message && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { isTyping: true });
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    typingTimeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.emit('typing', { isTyping: false });
      }
    }, 2000);

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [message, isTyping, user]);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-gray-200 bg-white"
    >
      <div className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!message.trim() || isSending || !user}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSending ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending
            </span>
          ) : (
            'Send'
          )}
        </button>
      </div>
      <div className="text-xs text-right mt-1 text-gray-500">
        {500 - message.length} characters remaining
      </div>
      {user && (
        <div className="text-xs text-left mt-1 text-gray-500">
          Sending as: {user.nickname}
        </div>
      )}
    </form>
  );
}