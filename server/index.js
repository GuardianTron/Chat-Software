require('dotenv').config();
const app = require('express')();
const cors = require('cors');
app.use(cors());
const server = require('http').Server(app);
const io = require('socket.io')(server);

const {TextMessageFilter,ImageMessageFilter,PrivateMessageUserFilter} = require("./models/MessageFilters");
const {Message,PrivateMessage} = require("./models/message");
const {ChatServer} = require("./models/ChatServer");






server.listen(process.env.CHAT_PORT || 3001);

const chatServer = new ChatServer(io);
chatServer.attachFilter(new TextMessageFilter(1000),[Message.MESSAGE,PrivateMessage.MESSAGE]);
chatServer.attachFilter(new ImageMessageFilter(250,250, 10 * Math.pow(2,20)),[Message.IMAGE,PrivateMessage.IMAGE]);
chatServer.attachFilter(new PrivateMessageUserFilter(),[PrivateMessage.MESSAGE,PrivateMessage.IMAGE]);


chatServer.init();


