const {Users} = require("./Users");
const {UserError} = require("./error");
const {ServerAnnouncementMessage,Message,PrivateMessage} = require("./message");


const LOGIN = "login";
const CHAT_MESSAGE = "message";
const PRIVATE_MESSAGE = "private-message";
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
        this.typeFilters = {};
        this.channelFilters = {};
        this.initialized = false;
        //set up initial validation configurations for client
        this.validationConfigs = {
            username: this.users.getValidationConfig(),
            type: {},
            channel: {}
        };


        
        this.attachMessageRouter(this.sendMessageToChatroom,CHAT_MESSAGE);
        this.attachMessageRouter(this.sendPrivateMessage,PRIVATE_MESSAGE);
    }

    attachMessageRouter = (handler, channel) => {
        this.messageRouters[channel] = handler;

    }

    attachTypeFilter = (filter, messageTypes = "all")=>{
       this._attachValidationData(this.validationConfigs.type,filter,messageTypes);
       this._attachCallback(this.typeFilters,filter,messageTypes);
    }

    attachChannelFilter = (filter,channels = "all") => {
        this._attachValidationData(this.validationConfigs.channel,filter,channels);
        this._attachCallback(this.channelFilters,filter,channels);
    }

    _attachCallback(destObj,filter,events){
        filter.attachServer(this);
        if(!(events instanceof Array)){
            events = [events];
        }
       
       for(let event of events){
            
            if(!destObj.hasOwnProperty(event)){
                destObj[event] = [];
             }
            console.log(`Attaching filter for ${event}`);
            destObj[event].push(filter);
            
        }
    }

    _attachValidationData(destObj,filter,types){
        if(!(types instanceof Array)){
            types = [types];
        }
        for(let type of types){
            if(!destObj.hasOwnProperty(type)){
                destObj[type] = [];
            }
            destObj[type].push(filter.getValidationConfig());
        }
    }

    async _runCallbacks(filters,event,data){
        //handle generic message filters if they exist
        if(filters.hasOwnProperty('all') && filters['all'] > 0){
            await (Promise.all(filters['all'].map(async filter =>{return filter.filter(data)})));
        }

        //handle message filers for specified type
        if(filters[event]){
           await (Promise.all(filters[event].map(async filter =>{return filter.filter(data)})));
       }
    }

    

    init = ()=>{;
        //only set up call backs for first initialization
        if(this.initialized) return;
        this.initialized = true;
        this.io.on("connection", socket =>{
            socket.on(LOGIN,this.login(socket));
            socket.on(CHAT_MESSAGE, this.sendMessages(socket) );
            socket.on(PRIVATE_MESSAGE,this.sendMessages(socket));
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
                this.sendUpdatedUserList();
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
               //ensure that only data of allowed types is passed
               if((!data.type in Object.keys(this.typeFilters))){
                   throw new Error(`${data.type} is not supported.`);
               }
               await this._runCallbacks(this.typeFilters,data.type,data);
               await this._runCallbacks(this.channelFilters,data.channel,data);
               if(this.messageRouters[data.channel]){
                   this.messageRouters[data.channel](data);
               }
               else throw new Error(`${data.channel} does not have a registered router.`);
              
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

    sendMessageToChatroom = (data) =>{
        console.log('Sending chat',data);
        this.io.sockets.emit(CHAT_MESSAGE,(new Message(CHAT_MESSAGE,data).toJSON()));
    }

    sendErrorToUser(socketId,message){
        console.log(message);
        this.io.to(socketId).emit(ERROR_MESSAGE,message);
    }

    sendPrivateMessage = (data) =>{
        console.log("Sending PM: ", data);
        this.io.to(data.toSocketId).emit(PRIVATE_MESSAGE,(new PrivateMessage(PRIVATE_MESSAGE,data)).toJSON());
    }

    handleError(error){
        console.log(error);
    }

    


}

ChatServer.CHAT_MESSAGE = CHAT_MESSAGE;
ChatServer.PRIVATE_MESSAGE = PRIVATE_MESSAGE;


module.exports.ChatServer = ChatServer;