import express from 'express';
import cors from "cors";
import http from 'http';
import { Server } from "socket.io";
import { chatSessions, connectToDatabase, conversations, messages } from './dbConfig';
import bodyParser from 'body-parser';
import { storeMessage, updateChatSession } from './controller';
// Replace the uri string with your connection string.
import langPoc from './lang-poc';
var responseTime = require('response-time')
const app = express();
const server = http.createServer(app);
app.use(express.json());

app.use(cors())
app.use(langPoc);

// connectToDatabase().then(() => {
//   // const io = new Server(server, {
//   //   cors: {
//   //     origin: "http://localhost:5173",
//   //     methods: ["GET", "POST"]
//   //   }
//   // });

//   // // handle the chat sessions table
//   // io.use(async (socket, next) => {
//   //   const userId = socket.handshake.auth.userId;
//   //   if (!userId) {
//   //     return next(new Error("invalid username"));
//   //   }
//   //   // @ts-ignore
//   //   socket.userId = userId;
//   //   await updateChatSession({ socketId: socket.id, userId: userId, lastSeen: new Date(), status: 'online' })
//   //   next();
//   // });

//   // io.on('connection', (socket) => {

//   //   socket.on("msg", async ({ content, to }) => {
//   //     console.log(content, to);
//   //     const result = await chatSessions.findOne({ userId: to });

//   //     if (result && result.status === 'online') {
//   //       socket.emit("msg", {
//   //         content,
//   //         createdAt: new Date(),
//   //         receiverId: to,
//   //         // @ts-ignore
//   //         senderId: socket.userId,
//   //         status: 'delivered',
//   //         read: true
//   //       });
//   //       socket.to(result.socketId).emit("msg", {
//   //         content,
//   //         createdAt: new Date(),
//   //         receiverId: to,
//   //         // @ts-ignore
//   //         senderId: socket.userId,
//   //         status: 'delivered'
//   //       });
//   //       storeMessage({
//   //         content,
//   //         createdAt: new Date(),
//   //         receiverId: to,
//   //         // @ts-ignore
//   //         senderId: socket.userId,
//   //         status: 'delivered',
//   //         read: false
//   //       })
//   //     } else {
//   //       // Send Notification
//   //       // Read or not
//   //       // Get no of unread messages
//   //       // Create a queue of pending messages, when user id connects send messages to that socket
//   //       socket.emit("msg", {
//   //         content,
//   //         createdAt: new Date(),
//   //         receiverId: to,
//   //         // @ts-ignore
//   //         senderId: socket.userId,
//   //         status: 'pending'
//   //       });
//   //       storeMessage({
//   //         content,
//   //         createdAt: new Date(),
//   //         receiverId: to,
//   //         // @ts-ignore
//   //         senderId: socket.userId,
//   //         status: 'pending',
//   //         read: false

//   //       })
//   //     }


//   //   });

//   //   socket.on('disconnect', async () => {
//   //     // @ts-ignore
//   //     await updateChatSession({ socketId: null, userId: socket.userId, lastSeen: new Date(), status: 'offline' })
//   //     console.log('user disconnected');
//   //   });
//   // });

//   // app.use(responseTime(function (req: any, res: any, time: any) {
//   //   var stat = (req.method + req.url).toLowerCase()
//   //     .replace(/[:.]/g, '')
//   //     .replace(/\//g, '_')
//   //   console.log(stat, time)
//   // }))

//   app.get("/", (req, res) => {
//     res.send("Hello from 3000").status(200);
//   })


//   // app.get("/user-chat-session", async (req, res) => {
//   //   const { id } = req.query;
//   //   const result = await chatSessions.findOne({ userId: id });
//   //   if (result) {
//   //     res.json(result).status(200);
//   //   } else {
//   //     res.json({ message: "Server Error" }).status(200);
//   //   }
//   // })

//   app.get("/user-chat-messages", async (req, res) => {
//     const { senderId, receiverId } = req.query;
//     console.log(senderId, receiverId);
//     const result = await messages.find({ senderId, receiverId }).toArray();
//     if (result) {
//       res.json(result).status(200);
//     } else {
//       res.json({ message: "Server Error" }).status(200);
//     }
//   })

//   app.get("/conversation", async (req, res) => {
//     const { user1, user2 } = req.query;
//     const c = await conversations.findOne({ users: { $all: [user1, user2] } });
//     if (c) {
//       const result = await messages.find({ conversationId: c._id }).toArray();
//       res.json(result).status(200);
//     } else {
//       res.json({ message: "No Conversation Found." }).status(200);
//     }
//   })
// })

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log("Server stated at 3000")
})

