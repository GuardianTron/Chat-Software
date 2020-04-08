require('dotenv').config();
const app = require('express')();
const cors = require('cors');
app.use(cors());
const server = require('http').Server(app);
const io = require('socket.io')(server);

const {Users, UserExistsError, InvalidUserError} = require("./models/Users");
const {Message,ChatMessage,ImageMessage} = require("./message");

const users = new Users();



server.listen(process.env.CHAT_PORT || 3001);

io.on('connection', socket =>{
    console.log("connection established");
    socket.on(Message.LOGIN,data =>{
        console.log(data);
        
        try{
            users.addUser(data.senderUsername,socket.id);
            console.log(`Added user: ${data.senderUsername}:${socket.id}`);
            data.payload = "Welcome to the chat";
            socket.emit(Message.WELCOME,{payload:"Welcome to the chat",senderUsername:data.username});
        }
        catch(error){
            console.log(error.message);
            socket.emit(Message.NAME_ERROR,{payload: error.message});
            socket.disconnect();
            
        }
    });

    socket.on(Message.MESSAGE, data =>{
        console.log(data,socket.id);
        //inject username into message to prevent spoofing
        try{
            const username = users.getUsernameBySocketId(socket.id);
            console.log(username);
            data.senderUsername = username;
            data.fromSocketId = socket.id;
            const message = new ChatMessage(data)
            console.log(message,message.toJSON());
            io.sockets.emit(message.type,message.toJSON());
        }
        catch(e){
            console.log(e.message);
        }
        
    });

    socket.on(Message.IMAGE,data =>{
        const username = users.getUsernameBySocketId(socket.id);
        console.log(username);
        data.senderUsername = username;
        data.fromSocketId = socket.id;
        const message = new ImageMessage(data)
        console.log(message,message.toJSON());
        io.sockets.emit(message.type,message.toJSON());
    });

   
    socket.on(Message.DISCONNECT,data =>{
        console.log(data);
    });
});

