require('dotenv').config();
const app = require('express')();
const cors = require('cors');
app.use(cors());
const server = require('http').Server(app);
const io = require('socket.io')(server);

const {Users, UserExistsError, InvalidUserError} = require("./models/Users");


const users = new Users();



server.listen(process.env.CHAT_PORT || 3001);

io.on('connection', socket =>{
    console.log("connection established");
    socket.on('login',data =>{
        console.log(data);
        
        try{
            users.addUser(data.username,socket.id);
            console.log(`Added user: ${data.username}:${socket.id}`);
            socket.emit('welcome',{message:"Welcome to the chat",username:data.username});
        }
        catch(error){
            console.log(error.message);
            socket.emit('name-error',{message: error.message});
            socket.disconnect();
            
        }
    });

    socket.on('message', data =>{
        console.log(data,socket.id);
        //inject username into message to prevent spoofing
        try{
            const username = users.getUsernameBySocketId(socket.id);
            io.sockets.emit('message',{
                type: "message",
                username: username,
                message: data.message
            });
        }
        catch(e){
            console.log(e.message);
        }
        
    });
    
    socket.on('disconnect',data =>{
        console.log(data);
    });
});

