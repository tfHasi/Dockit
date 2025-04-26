import { useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '../hoc/withAuth';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import OnlineUsers from '../components/OnlineUsers';
import { useAuth } from './_app';
import { initSocket, disconnectSocket } from '../lib/socket';

function Chat() {
  const { user, logout } = useAuth();

  useEffect(() => {
    const socket = initSocket();
    
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <>
      <Head>
        <title>Chat Room | Chat App</title>
      </Head>
      
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Chat Room</h1>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.nickname}</span>
              <button
                onClick={logout}
                className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat area */}
          <div className="flex flex-col flex-1">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <MessageList />
            </div>
            
            {/* Message input */}
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