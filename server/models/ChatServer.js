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
        this.messageRouters =  {};
        this.messageFilters = {};
        this.initialized = false;
    }

    attachMessageRouter = (handler, messageType) => {
        this.messageRouters[messageType] = handler;

    }

    attachFilter = (filter, messageTypes = "all")=>{
        filter.attachServer(this);
        if(!messageType instanceof Array){
            messageTypes = [messageTypes];
        }
        for(let messageType in messageTypes){
            if(!this.messageFilters.hasOwnProperty(messageType)){
                this.messageFilters[messageType] = [];
             }
            this.messageFilters[messageType].push(filter);
        }
    }
    

    init = ()=>{
        //only set up call backs for first initialization
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

    sendMessages = (socket) =>{
        return async (data) =>{
            if(this.messageRouters.length === 0){
                throw new Error("Must attach message router before messages can be send.");
            }
            try{
               const username = this.users.getUsernameBySocketId(socket.id);
               data.senderUsername = username;
               data.fromSocketId = socket.id;
               //handle generic message filters
               await (Promise.all(this.messageFilters['all'].map(async filter =>{return filter.filter(data)})));

               //handle message filers for specified type
               if(this.messageFilters[data.type]){
                   await (Promise.all(this.messageFilters[data.type].map(async filter =>{return filter.filter(data)})));
               }

               if(this.messageRouters[data.type]){
                   this.messageRouters[data.type](this,data);
               }
              
            }
            catch(error){
                if(error instanceof UserError){
                    const message = {};
                    message.payload = error.message;
                    if(data.toSocketId){
                        message.toSocketId = data.toSocketId;
                    }
                    this.sendErrorToUser(socket.id,message);
                }
                this.handleError(error);
            }
        };
    }

    sendUpdatedUserList = ()=>{
        this.io.sockets.emit(UPDATE_USER_LIST,{payload:this.users.getAllUsers()});
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