import { useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '../hoc/withAuth';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import OnlineUsers from '../components/OnlineUsers';
import { useAuth } from '../context/AuthContext';
import { disconnectSocket } from '../lib/socket';

function Chat() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      disconnectSocket();
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Chat Room | Chat App</title>
      </Head>
      <div className="flex flex-col h-screen">
        {/* Header with logout button */}
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
          <h1 className="text-xl font-bold">Chat Room</h1>
          <div className="flex items-center">
            {user && (
              <span className="mr-4 text-sm">
                Logged in as: <span className="font-semibold">{user.nickname}</span>
              </span>
            )}
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Logout
            </button>
          </div>
        </header>
        
        {/* Main chat interface */}
        <div className="flex flex-1 overflow-hidden">
          {/* Messages area */}
          <div className="flex-1 flex flex-col">
            <MessageList />
            <MessageInput />
          </div>
          
          {/* Online users sidebar */}
          <OnlineUsers />
        </div>
      </div>
    </>
  );
}

export default withAuth(Chat);