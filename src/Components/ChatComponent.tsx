import { useState, useEffect, useRef } from "react";
import ChatClient from "../Engine/ChatClient";
import "./Chatcomponent.css";

interface ChatcomponentProps {
  userName: string;
}

interface ClientMessageProp {
  user: string;
  msg: string;
  timestamp: string;
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

  function getChatScopes(msgObj: ClientMessageProp, index: number) {
    const isLastMessage = index === chatLog.length - 1;

    if (msgObj.user === userName) {
      return (
        <div
          className="chat-message-current"
          key={index}
          ref={isLastMessage ? bottomRef : null}
        >
          <span className="user">{`${msgObj.user} [${msgObj.timestamp}]`}</span>
          : <span className="message-current">{msgObj.msg}</span>
        </div>
      );
    } else if (
      msgObj.user === "System" &&
      msgObj.msg === "[WARNING] No more history messages"
    ) {
      return null;
    } else {
      return (
        <div
          className="chat-message-other"
          key={index}
          ref={isLastMessage ? bottomRef : null}
        >
          <span className="user">{`${msgObj.user} [${msgObj.timestamp}]`}</span>
          : <span className="message-other">{msgObj.msg}</span>
        </div>
      );
    }
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
