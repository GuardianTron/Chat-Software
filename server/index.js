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

/*
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
            if(data.type == Message.IMAGE){
                ImageModel.bufferToPng(data.payload.buffer)
                .then(
                    (buffer) =>{
                        data.payload.type="image/png";
                        data.payload.buffer = buffer;
                        const message = new ImageMessage(data);
                        io.sockets.emit(Message.MESSAGE,message.toJSON());
                    }
                ).catch(
                    (e) => console.log(e.message)
                );
                
            }
            else{
                let message = new ChatMessage(data);
                console.log(message,message.toJSON());
                io.sockets.emit(Message.MESSAGE, message.toJSON());
            }
        }
        catch(e){
            socket.disconnect(true);
        }
        
    });
    /*

    socket.on(Message.IMAGE,data =>{
        const username = users.getUsernameBySocketId(socket.id);
        console.log(username);
        data.senderUsername = username;
        data.fromSocketId = socket.id;
        const message = new ImageMessage(data)
        console.log(message,message.toJSON());
        io.sockets.emit(message.type,message.toJSON());
    });
    
   
    socket.on('disconnect',data =>{
        const username = users.getUsernameBySocketId(socket.id);
        users.removeUserBySocketId(socket.id);
        io.sockets.emit(Message.MESSAGE,{type:"server-room-announcement",
                                        payload: `${username} has left the room.`});
    });
});
*/
