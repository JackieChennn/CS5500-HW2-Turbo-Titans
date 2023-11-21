import React from 'react';
import ChatBody from './Chatbody';
import ChatFooter from './Chatfooter';
import "./Chatpage.css";

const ChatPage = () => {
  return (
    
      <div className="chat__main">
        <ChatBody />
        <ChatFooter />
      </div>
    
  );
};

export default ChatPage;