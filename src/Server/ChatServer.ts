import express from "express";
import http from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import { PortsGlobal } from "../ServerDataDefinitions";

interface MessageProp {
  id: number;
  user: string;
  msg: string;
  timestamp: string;
  reactions: { thumbsUp: number; love: number };
  replies: MessageProp[];
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  serveClient: false,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// const redis = new Redis(); // connect to 127.0.0.1:6379

const redis = new Redis("redis://red-claljqeg1b2c73a6lb80:6379", {
  // This is the default value of `retryStrategy`
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

io.on("connection", (socket) => {
  console.log(`A user connected:${socket.id}}`);

  let sub: Redis | null = new Redis("redis://red-claljqeg1b2c73a6lb80:6379");
  let pub: Redis | null = new Redis("redis://red-claljqeg1b2c73a6lb80:6379");

  let startId: string;
  let reachEnd: boolean = false;

  // -------------------- Message Publisher -------------------- //
  socket.on("send_message", async (message: MessageProp) => {
    if (startId === undefined) {
      await getStartId();
    }
    // add new message to Redis chat stream
    await pub!.xadd(
      "chat",
      "*",
      "id",
      message.id.toString(),
      "username",
      message.user,
      "timestamp",
      message.timestamp.toString(),
      "message",
      message.msg,
      "thumbsUp",
      "0",
      "love",
      "0"
    );
    const chatLength = await redis.xlen("chat");
    // trim chat stream to 200 messages
    if (chatLength > 200) {
      await redis.xtrim("chat", "MAXLEN", 200);
    }
  });

  // -------------------- Reaction Publisher -------------------- //
  socket.on("send_reaction", async (message: MessageProp, emoji: string) => {
    // update reaction count in Redis chat stream
    if (emoji === "thumbsUp") {
      await redis.hincrby(`chat:${message.id}`, "thumbsUp", 1);
    } else if (emoji === "love") {
      await redis.hincrby(`chat:${message.id}`, "love", 1);
    }
    
  });

  socket.on("send_reply", async (message: MessageProp, reply: MessageProp) => {
    // Add new reply to Redis chat stream
    await pub!.xadd(
      "chat",
      "*",
      "id", reply.id.toString(),
      "username", reply.user,
      "timestamp", reply.timestamp.toString(),
      "message", reply.msg,
      "thumbsUp", "0",
      "love", "0",
      "replyTo", message.id.toString() // Reference to the original message
    );
    const chatLength = await redis.xlen("chat");
    // trim chat stream to 200 messages
    if (chatLength > 200) {
      await redis.xtrim("chat", "MAXLEN", 200);
    }
  });
  

  // -------------------- Message Cousumer -------------------- //
  // helper function to convert stream value to json object
  const processMessage = (message: any) => {
    const id = parseInt(message[1][1]);
    const user = message[1][3];
    const timestamp = message[1][5];
    const msg = message[1][7];
    const thumbsUp = parseInt(message[1][9]);
    const love = parseInt(message[1][11]);
    const messageObj: MessageProp = {
      id,
      user,
      timestamp,
      msg,
      reactions: { thumbsUp, love },
      replies: [] // Replies would need to be handled separately
    };
    console.log(messageObj);
    socket.emit("new_message", messageObj);
  };


  async function listenForMessage(lastId = "$") {
    // `results` is an array, each element of which corresponds to a key.
    if (sub === null) {
      return;
    }
    const results = await sub!.xread("BLOCK", 0, "STREAMS", "chat", lastId);
    if (results === null) {
      await listenForMessage();
    } else {
      const [key, messages] = results[0];
      messages.forEach(processMessage);
      // Pass the last id of the results to the next round.
      await listenForMessage(messages[messages.length - 1][0]);
    }
  }
  listenForMessage();

  // -------------------- Message History -------------------- //
  async function getStartId() {
    const allMessages = await redis.xrange("chat", "-", "+");
    if (allMessages.length === 0) {
      startId = "+";
    } else {
      startId = allMessages[allMessages.length - 1][0];
    }
  }
  socket.on("request_history", async () => {
    if (reachEnd) {
      socket.emit("history_message", [
        {
          user: "System",
          timestamp: new Date().toDateString(),
          msg: "[WARNING] No more history messages",
        },
      ]);
      return;
    }
    if (startId === undefined) {
      await getStartId();
      if (startId === "+") {
        socket.emit("history_message", [
          {
            user: "System",
            timestamp: new Date().toDateString(),
            msg: "[WARNING] No more history messages",
          },
        ]);
        reachEnd = true;
        return;
      }
    }
    // get last 20 messages
    const messages = await redis.xrevrange("chat", startId, "-", "COUNT", "20");
    // check if there are more messages
    if (messages.length < 20) {
      reachEnd = true;
    } else {
      const pre_messages = await redis.xrevrange(
        "chat",
        messages[messages.length - 1][0],
        "-",
        "COUNT",
        "2"
      );
      if (pre_messages.length < 2) {
        reachEnd = true;
      } else {
        startId = pre_messages[1][0];
      }
    }
    const messageObjs: MessageProp[] = [];
    messages.reverse();
    messages.forEach((message: any) => {
      const user = message[1][1];
      const timestamp = message[1][3];
      const msg = message[1][5];
      const messageObj: MessageProp = {
        id: parseInt(message[0]),
        user,
        timestamp,
        msg,
        reactions: { thumbsUp: 0, love: 0 },
        replies: [],
      };
      messageObjs.push(messageObj);
    });
    socket.emit("history_message", messageObjs);
  });

  // -------------------- Disconnect -------------------- //
  socket.on("disconnect", () => {
    console.log("user disconnected");
    sub!.quit();
    pub!.quit();
    sub = null;
    pub = null;
  });
});

const port = PortsGlobal.chatServerPort;

server.listen(port, () => {
  console.log(`listening on *: ${port}`);
});
