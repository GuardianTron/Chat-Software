require('dotenv').config();
const app = require('express')();
const cors = require('cors');
app.use(cors());
const server = require('http').Server(app);
const io = require('socket.io')(server);

const users = {};

server.listen(process.env.CHAT_PORT || 3001);

io.on('connection', socket =>{
    console.log("connection established");
    socket.on('login',data =>{
        console.log(data);
        if(!users.hasOwnProperty(data.username)){
            users[data.username] = socket;
            console.log(`Added user: ${data.username}`);
            socket.emit('welcome',{message:"Welcome to the chat",username:"muh-name"});
        }
        else{
            console.log(`Username: ${data.username} has already been used.`);
            socket.emit('name-error',{message:"Username has already been used."});
            socket.disconnect();
        }
    });
    
    socket.on('disconnect',data =>{
        console.log(data);
    });
});

