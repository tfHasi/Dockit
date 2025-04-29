import { useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '../hoc/withAuth';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import OnlineUsers from '../components/OnlineUsers';

function Chat() {
  useEffect(() => {
  }, []);

  return (
    <>
      <Head>
        <title>Chat Room | Chat App</title>
      </Head>
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <MessageList />
          <MessageInput />
        </div>
        <OnlineUsers />
      </div>
    </>
  );
}

export default withAuth(Chat);