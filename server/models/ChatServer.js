const {Users} = require("./Users");
const {UserError} = require("./error");
const {ServerAnnouncementMessage} = require("./message");


const LOGIN = "login";
const CHAT_MESSAGE = "message";
const USER_DISCONNECT = "disconnect";
const UPDATE_USER_LIST = "update-user-list";
const SERVER_ANNOUNCEMENT = "server-announcement";
const WELCOME = "welcome";

const ERROR_MESSAGE = "user-error";


class ChatServer{

    constructor(io){
        this.io = io;
        this.users = new Users();
        this.messageHandlers =  {};
        this.initialized = false;
    }

    attachMessageHandler = (messageType,handler) => {
        handler.attachServer(this);
        this.messageHandlers[messageType] = handler;

    }

    init = ()=>{
        //only set up call backs for first initializton
        if(this.initialized) return;
        this.initialized = true;
        this.io.on("connection", socket =>{
            socket.on(LOGIN,this.login(socket));
            socket.on(CHAT_MESSAGE, this.sendMessages(socket) );
            socket.on(USER_DISCONNECT,this.userDisconnect(socket));
        });
    }

    login = (socket) => {
        return (data) => {
            try{
                this.users.addUser(data.senderUsername,socket.id);
                console.log(`Added user: ${data.senderUsername}:${socket.id}`);
                socket.emit(WELCOME,{});
                this.sendServerAnnouncement(`${data.senderUsername} has joined the chat.`);
                this.sendUpdatedUserList();
                
            }
            catch(error){
                if(error instanceof UserError) this.sendErrorToUser(socket.id,{payload: error.message});
                this.handleError(error);
                socket.disconnect();
            
            }
        };
    }

    userDisconnect = (socket) => {
        return () =>{
            try{
                const username = this.users.getUsernameBySocketId(socket.id);
                this.users.removeUserBySocketId(socket.id);
                this.sendServerAnnouncement(`${username} has left the chat.`);
            }
            catch(error){
                this.handleError(error);
            }
        };
    }

    sendMessages = (socket)=>{
        return (data) =>{
            if(this.messageHandlers.length === 0){
                throw new Error("Must attach message handler before messages can be send.");
            }
            try{
               const username = this.users.getUsernameBySocketId(socket.id);
               data.senderUsername = username;
               data.fromSocketId = socket.id;
               if(this.messageHandlers[data.type]){
                   this.messageHandlers[data.type].handle(data);
               }
              
            }
            catch(e){
                this.handleError(error);
                socket.disconnect(true);
            }
        };
    }

    sendUpdatedUserList = ()=>{
        this.io.sockets.emit(UPDATE_USER_LIST,this.users.getAllUsers());
    }

    sendServerAnnouncement = (message) => {
        this.io.sockets.emit(CHAT_MESSAGE,(new ServerAnnouncementMessage({payload: message})).toJSON());
    }

    sendMessageToChatroom(data){
        console.log(data);
        this.io.sockets.emit(CHAT_MESSAGE,data);
    }

    sendErrorToUser(socketId,message){
        console.log(message);
        this.io.to(socketId).emit(ERROR_MESSAGE,message);
    }

    handleError(error){
        console.log(error.message);
    }

    


}
module.exports.ChatServer = ChatServer;