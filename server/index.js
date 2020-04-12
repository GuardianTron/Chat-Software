require('dotenv').config();
const app = require('express')();
const cors = require('cors');
app.use(cors());
const server = require('http').Server(app);
const io = require('socket.io')(server);

const {ChatMessageHandler,ImageMessageHandler} = require("./models/MessageHandlers");
const {Message} = require("./models/message");
const {ChatServer} = require("./models/ChatServer");





server.listen(process.env.CHAT_PORT || 3001);

const chatServer = new ChatServer(io);
chatServer.attachMessageHandler(Message.MESSAGE,new ChatMessageHandler(1000));
chatServer.attachMessageHandler(Message.IMAGE,new ImageMessageHandler(250,250, 10 * Math.pow(2,20)));
chatServer.init();


