import io from "socket.io-client";
import {
  PortsGlobal,
  LOCAL_SERVER_URL,
  RENDER_CHAT_SERVER_URL,
} from "../ServerDataDefinitions";

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

class ChatClient {
  private _userName: string;
  private _serverURL: string;
  private _localServerURL: string = LOCAL_SERVER_URL;
  private _renderServerURL: string = RENDER_CHAT_SERVER_URL;
  private _serverPort: number = PortsGlobal.chatServerPort;
  private _socket: any;
  constructor(userName: string) {
    this._userName = userName;
    this._serverURL = `${this._renderServerURL}`;
  }

  connect(
    onMessageReceived: (msg: ClientMessageProp) => void,
    onHistoryMessageReceived: (msgs: ClientMessageProp[]) => void
  ) {
    this._socket = io(this._serverURL, {
      reconnection: true,
      reconnectionAttempts: 5,
    });

    this._socket.on("new_message", (messageObj: ClientMessageProp) => {
      // convert json to string format
      // const msg: string = `${messageObj.user} [${messageObj.timestamp}]: ${messageObj.msg}`;
      onMessageReceived(messageObj);
    });
    this._socket.on("history_message", (messageObjs: ClientMessageProp[]) => {
      // let msgs: string[] = [];
      // messageObjs.forEach((messageObj: ClientMessageProp) => {
      //     const msg: string = `${messageObj.user} [${messageObj.timestamp}]: ${messageObj.msg}`;
      //     msgs.push(msg);
      // });
      onHistoryMessageReceived(messageObjs);
    });
    this._socket.on("connect", () => {
      console.log(`id: ${this._socket.id}`);
    });
  }

  sendMessage(message: string, replyToMessage?: ClientMessageProp) {
    if (this._socket && this._userName !== "") {
        const vancouverTimezone = "America/Vancouver";
        const options = { timeZone: vancouverTimezone, hour12: false };

      const currentTime = new Date().toLocaleString("en-US", options);
      if (replyToMessage) {
        const messageObj: ClientMessageProp = {
          id: Date.now(), // Assuming unique ID generation for each message
          user: this._userName,
          msg: `Reply to ${replyToMessage.user} [${replyToMessage.timestamp}] ${replyToMessage.msg} ==> ${message}`,
          timestamp: currentTime,
          reactions: [0, 0],
          replies: []
        };
        this._socket.emit("send_message", messageObj);
      } else {
        const messageObj: ClientMessageProp = {
          id: Date.now(), // Assuming unique ID generation for each message
          user: this._userName,
          msg: message,
          timestamp: currentTime,
          reactions: [0, 0],
          replies: []
        };
        this._socket.emit("send_message", messageObj);
      }
    } else if (this._userName === "") {
        alert("Please enter a user name!");
    } else {
        alert("Please connect to the server first!");
    }
}


  sendReaction(msgObj: ClientMessageProp, emoji: string) {
    if (this._socket && this._userName !== "") {
      this._socket.emit("send_reaction", msgObj, emoji);
    } else if (this._userName === "") {
      alert("Please enter a user name!");
    } else {
      alert("Please connect to the server first!");
    }
  }

  sendReply(originalMsgObj: ClientMessageProp, replyMessage: string) {
    if (this._socket && this._userName !== "") {
      const currentTime = new Date().toISOString();
      const replyMsgObj: ClientMessageProp = {
        id: Date.now(),
        user: this._userName,
        msg: replyMessage,
        timestamp: currentTime,
        reactions: [0, 0],
        replies: [originalMsgObj]
      };
      this._socket.emit("send_reply", originalMsgObj, replyMsgObj);
    } else if (this._userName === "") {
      alert("Please enter a user name!");
    } else {
      alert("Please connect to the server first!");
    }
  }


  loadHistoryMessage() {
    if (this._socket && this._userName !== "") {
      this._socket.emit("request_history");
    } else if (this._userName === "") {
      alert("Please enter a user name!");
    } else {
      alert("Please connect to the server first!");
    }
  }

  disconnect() {
    if (this._socket) {
      this._socket.disconnect();
    }
  }

  public get userName() {
    return this._userName;
  }

  public set userName(value: string) {
    this._userName = value;
  }

  public get socketId() {
    return this._socket.id;
  }
}
export default ChatClient;
