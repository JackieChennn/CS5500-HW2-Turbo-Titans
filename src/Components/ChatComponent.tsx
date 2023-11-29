import { useState, useEffect, useRef } from "react";
import ChatClient from "../Engine/ChatClient";
import "./Chatcomponent.css";

interface ChatcomponentProps {
  userName: string;
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

function Chatcomponent({ userName }: ChatcomponentProps) {
  const [chatLog, setChatLog] = useState<ClientMessageProp[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null); // Correctly typed ref for the auto-scroll feature

  const onMessageReceived = (msg: ClientMessageProp) => {
    setChatLog((prevLog) => [...prevLog, msg]);
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
    let inputElement = document.getElementById(
      "inputMessage"
    ) as HTMLInputElement;
    let currentMessage = inputElement.value;

    if (currentMessage.length !== 0) {
      chatClient.sendMessage(currentMessage);
      inputElement.value = "";
    } else {
      alert("Message cannot be empty!");
    }
  };

  function handleReaction(msgObj: ClientMessageProp, reactionType: 'thumbsUp' | 'love') {
    const updatedChatLog = chatLog.map(msg => {
      if (msg.id === msgObj.id) {
        // Ensure reactions array is initialized
        if (!msg.reactions) {
          msg.reactions = [0, 0];
        }
  
        // Update reactions in an immutable way
        const newReactions = [...msg.reactions];
        if (reactionType === 'thumbsUp') {
          newReactions[0] += 1;
        } else {
          newReactions[1] += 1;
        }
  
        // Return updated message
        return { ...msg, reactions: newReactions };
      }
      return msg;
    });
  
    setChatLog(updatedChatLog);
    chatClient.sendReaction(msgObj, reactionType === 'thumbsUp' ? "👍" : "❤️");
  }
  
  


  function handleReply(msgObj: ClientMessageProp) {
    let inputElement = document.getElementById(
      "inputMessage"
    ) as HTMLInputElement;
    let currentMessage = inputElement.value;

    if (currentMessage.length !== 0) {
      chatClient.sendReply(msgObj, currentMessage);
      inputElement.value = "";
    } else {
      alert("Message cannot be empty!");
    }
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
    const thumbsUpCount = msgObj.reactions?.[0] || 0; // Safe access with default value
    const loveCount = msgObj.reactions?.[1] || 0; // Safe access with default value

    return (
      <div
        className={`chat-message-${msgObj.user === userName ? "current" : "other"}`}
        key={index}
        ref={isLastMessage ? bottomRef : null}
      >
        <span className="user">{`${msgObj.user} [${msgObj.timestamp}]`}</span>
        : <span className={`message-${msgObj.user === userName ? "current" : "other"}`}>{msgObj.msg}</span>
        <div className="reactions">
          <button onClick={() => handleReaction(msgObj, 'thumbsUp')}>👍 {thumbsUpCount}</button>
          <button onClick={() => handleReaction(msgObj, 'love')}>❤️ {loveCount}</button>
          <button onClick={() => handleReply(msgObj)}>Reply</button>
          </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <button onClick={() => chatClient.loadHistoryMessage()}>Load More</button>
      <div className="chat-window">
        {chatLog.map((msgObj, index) => getChatScopes(msgObj, index))}
      </div>
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
      </div>
    </div>
  );
}

export default Chatcomponent;
