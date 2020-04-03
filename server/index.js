require('dotenv').config();
const app = require('express')();
const cors = require('cors');
app.use(cors());
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(process.env.CHAT_PORT || 3001);

io.on('connection', socket =>{
    socket.emit('welcome',{message:"Welcome to the chat"});

    socket.on('disconnect',data =>{
        console.log(data);
    });
});

