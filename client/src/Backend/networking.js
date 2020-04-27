import openSocket from "socket.io-client";


export default class ChatConnection{

    constructor(url){
        this.url = url;
    }
    
    /**
     * Establishes a connection to the server and logs
     * in the user.
     * @param {String} username
     * @event UserError - when the username is taken or invalid
     * @event welcome - when the user has successfully connected. 
     * @event message - emitted when a message is received.
     * @event privateMessage - emitted when a private message is received. 
     * @event UpdateUserList --emitted when users enter or leave the chat 
     * @event ServerDisconnect -- emitted when the server disconnects the user
     */

    connect = (username) => {
        
        /*
         * Prevent event handlers from 
         * being added multiple times in event
         * of reconnection
         */

        if(this.socket){
            this.socket.removeAllListeners('user-error');
            this.socket.removeAllListeners('welcome');
            this.socket.removeAllListeners('message');
            this.socket.removeAllListeners('private-message');
            this.socket.removeAllListeners('update-user-list');
            this.socket.removeAllListeners('disconnect');
        }
        
        this.socket =  openSocket(this.url);    
        this.socket.on('user-error',this.onUserError);
        this.socket.on('welcome',this.onWelcome);
        this.socket.on('message',this.onMessage);
        this.socket.on('private-message',this.onPrivateMessage);
        this.socket.on('update-user-list',this.onUpdateUserList);
        this.socket.on('disconnect',this.onServerDisconnect);
        

        this.username = username;
        
        this.socket.emit('login',{senderUsername: username});
        
        

    }

    disconnect = () =>{
        this.socket.disconnect();
    }


    __createBasicMessageObj(){
        const message = {};
        message.channel = 'message';
        message.senderUsername = this.username;
        message.fromSocketId = this.socket.id;
        message.time = Date.now();
        message.type = null;
        message.payload = null;
        return message;
    }

    __createBasicPrivateMessageObj(){
        const message = this.__createBasicMessageObj();
        message.channel = 'private-message';
        message.toSocketId = null;
        message.toUsername = null;
        return message;
    }

    /**
     * Sends a generic message object to the 
     * @param Obj message 
     */

    send = (message)=>{
        this.socket.emit('message',message);
    }

    sendPM = (message) =>{
        this.socket.emit('private-message', message);
    }

    sendChatText = (message) => {
        const messageObj = this.__createBasicMessageObj();
        messageObj.type = "message";
        messageObj.payload = message;
        this.send(messageObj);
        return messageObj;

    }

    sendChatImage = (imageBuffer, imageMimeType) => {
        const messageObj = this.__createBasicMessageObj();
        messageObj.type = "image";
        messageObj.payload = {mime: imageMimeType, buffer: imageBuffer};
        this.send(messageObj);
        return messageObj;
        
    }

    sendPrivateText = (message,toUsername,toSocketId) => {
        const messageObj = this.__createBasicPrivateMessageObj();
        messageObj.type = "private-message";
        messageObj.toUsername = toUsername;
        messageObj.toSocketId = toSocketId;
        messageObj.payload = message;
        this.sendPM(messageObj);
        console.log(messageObj);
        return messageObj;

    }

    sendPrivateImage(imageBuffer,imageMimeType,toUsername,toSocketId){
        const messageObj = this.__createBasicPrivateMessageObj();
        messageObj.type = 'private-image';
        messageObj.toUsername = toUsername;
        messageObj.toSocketId = toSocketId;
        messageObj.payload = {mime: imageMimeType,buffer: imageBuffer};
        this.sendPM(messageObj);
        return messageObj;
    }



}