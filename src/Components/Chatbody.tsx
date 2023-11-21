import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatBody = () => {
  const navigate = useNavigate();

  const handleLeaveChat = () => {
    localStorage.removeItem('userName');
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <header className="chat__mainHeader">
        <p>Chat SpreadSheet "test"</p>
        <button className="leaveChat__btn" onClick={handleLeaveChat}>
          LEAVE CHAT
        </button>
      </header>

      {/*This shows messages sent from you*/}
      <div className="message__container">
        <div className="message__chats">
          <p className="sender__name">Fabiano</p>
          <div className="message__sender">
            <p>Hello there!</p>
          </div>
        </div>

        {/*This shows messages received by you*/}
        <div className="message__chats">
          <p className="recipient__name">Hanyu</p>
          <div className="message__recipient">
            <p>Hey guys, how are you?</p>
          </div>
        </div>

        <div className="message__chats">
          <p className="recipient__name">Jiacheng</p>
          <div className="message__recipient">
            <p>Hey, I'm good, you?</p>
          </div>
        </div>

        <div className="message__chats">
          <p className="recipient__name">Runjie</p>
          <div className="message__recipient">
            <p>I'm doing well, thanks.</p>
          </div>
        </div>

        {/*This is triggered when a user is typing*/}
        <div className="message__status">
          <p>Someone is typing...</p>
        </div>
      </div>
    </>
  );
};

export default ChatBody;