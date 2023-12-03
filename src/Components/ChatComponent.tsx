import { useState, useEffect, useRef } from "react";
import ChatClient from "../Engine/ChatClient";
import "./Chatcomponent.css";

interface ChatcomponentProps {
  userName: string;
  onClose: () => void;
  onNewMessage: () => void;
}

// the message body object
interface ClientMessageProp {
  id: number;
  user: string;
  msg: string;
  timestamp: string;
  // reactions[0] -> thumbs up
  // reactions[1] -> heart
  reactions: number[];
  replies: ClientMessageProp[];
}

const chatClient = new ChatClient("ricky");
const vancouverTimezone = "America/Vancouver";

function Chatcomponent({ userName, onClose, onNewMessage }: ChatcomponentProps) {
  const [chatLog, setChatLog] = useState<ClientMessageProp[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<ClientMessageProp | null>(null); // TODO: Add replies to the state
  const bottomRef = useRef<HTMLDivElement | null>(null); // Correctly typed ref for the auto-scroll feature

  const onMessageReceived = (msg: ClientMessageProp) => {
    setChatLog((prevLog) => [...prevLog, msg]);
    if (msg.user !== userName) {
      onNewMessage();
    }
  };

  const onHistoryMessageReceived = (msgs: ClientMessageProp[]) => {
    msgs.forEach((msg) => {
      if (
        msg.user === "System" &&
        msg.msg === "[WARNING] No more history messages"
      ) {
        alert("No more history messages");
        msgs.splice(msgs.indexOf(msg), 1);
      }
    });
    setChatLog((prevLog) => [...msgs, ...prevLog]);
  };

  useEffect(() => {
    chatClient.connect(onMessageReceived, onHistoryMessageReceived);
    return () => {
      chatClient.disconnect();
    };
  }, []);

  useEffect(() => {
    chatClient.userName = userName;
  }, [userName]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog]);

  const handleSendMessage = () => {
    let inputElement = document.getElementById("inputMessage") as HTMLInputElement;
    let currentMessage = inputElement.value;

    if (currentMessage.length !== 0) {
      if (replyToMessage) {
        chatClient.sendReply(replyToMessage, currentMessage);
        setReplyToMessage(null); // Reset reply state
      } else {
        chatClient.sendMessage(currentMessage);
      }
      inputElement.value = "";
    } else {
      alert("Message cannot be empty!");
    }
  };
  
  // (msg.id + thumbsup)
  function handleReaction(msgObj: ClientMessageProp, reactionType: 'thumbsUp' | 'love') {
    const updatedChatLog = chatLog.map(msg => {
      if (msg.timestamp === msgObj.timestamp) {
        // Ensure reactions array is initialized
        if (!msg.reactions) {
          msg.reactions = [0, 0];
        }
  
        // Update reactions in an immutable way
        if (reactionType === 'thumbsUp') {
          msg.reactions = [msg.reactions[0] + 1, msg.reactions[1]];
        } else {
          msg.reactions = [msg.reactions[0], msg.reactions[1] + 1];
        }
  
        // Return updated message
        return msg;
      }
      return msg;
    });
  
    setChatLog(updatedChatLog);
    chatClient.sendReaction(msgObj, reactionType === 'thumbsUp' ? "👍" : "❤️");
  }
  

  function handleReplyClick(msgObj: ClientMessageProp) {
    setReplyToMessage(msgObj);
    let inputElement = document.getElementById("inputMessage") as HTMLInputElement;
    inputElement.focus();
  }

  function renderReplies(replies: ClientMessageProp[]) {
    return replies.map((reply, index) => (
      <div className="chat-reply" key={index}>
        <span className="user">{`${reply.user} [${reply.timestamp}]`}</span>
        : <span className="message-reply">{reply.msg}</span>
      </div>
    ));
  }

  function getChatScopes(msgObj: ClientMessageProp, index: number) {
    const isLastMessage = index === chatLog.length - 1;

    return (
      <div
        className={`chat-message-${msgObj.user === userName ? "current" : "other"}`}
        key={index}
        ref={isLastMessage ? bottomRef : null}
      >
        <span className="user">{`${msgObj.user} [${msgObj.timestamp}]`}</span>
        : <span className={`message-${msgObj.user === userName ? "current" : "other"}`}>{msgObj.msg}</span>
        <div className="reactions">
          <button onClick={() => handleReaction(msgObj, 'thumbsUp')}>👍 {msgObj.reactions?.[0] || 0}</button>
          <button onClick={() => handleReaction(msgObj, 'love')}>❤️ {msgObj.reactions?.[1] || 0}</button>
          <button onClick={() => handleReplyClick(msgObj)}>Reply</button>
        </div>
        {msgObj.replies && msgObj.replies.length > 0 && (
          <div className="replies-container">
            {renderReplies(msgObj.replies)}
          </div>
        )}
      </div>
    );
  }
 
  return (
    <div className="chat-container">
      <button onClick={() => chatClient.loadHistoryMessage()}>Load More</button>
      <div className="chat-window">
        {chatLog.map((msgObj, index) => getChatScopes(msgObj, index))}
      </div>

      {/* Reply container placed above the send message box */}
      {replyToMessage && (
        <div className="reply-container">
          Replying to: {replyToMessage.user} [{replyToMessage.timestamp} {replyToMessage.msg}]
        </div>
      )}

      <div className="chat-input-container"> 
        <input
          placeholder="Enter a message"
          type="text"
          id="inputMessage"
          className="messageInput"
        />
        <button onClick={handleSendMessage} className="sendButton">
          Send
        </button>
        &nbsp;
        <button onClick={onClose} className="closeChatButton">
          Close
        </button>
      </div>
    </div>
  );
}

export default Chatcomponent;
