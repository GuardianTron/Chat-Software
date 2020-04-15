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
            this.socket.removeAllListeners('update-user-list');
            this.socket.removeAllListeners('disconnect');
        }
        
        this.socket =  openSocket(this.url);    
        this.socket.on('user-error',this.onUserError);
        this.socket.on('welcome',this.onWelcome);
        this.socket.on('message',this.onMessage);
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
        message.senderUsername = this.username;
        message.fromSocketId = this.socket.id;
        message.type = null;
        message.payload = null;
        return message;
    }

    /**
     * Sends a generic message object to the 
     * @param Obj message 
     */

    send = (message)=>{
        this.socket.emit('message',message);
    }

    sendChatText = (message) => {
        const messageObj = this.__createBasicMessageObj();
        messageObj.type = "message";
        messageObj.payload = message;
        this.send(messageObj);

    }

    sendChatImage = (imageBuffer, imageMimeType) => {
        const messageObj = this.__createBasicMessageObj();
        messageObj.type = "image";
        messageObj.payload = {mime: imageMimeType, buffer: imageBuffer};
        this.send(messageObj);
        
    }



}