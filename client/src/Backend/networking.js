import openSocket from "socket.io-client";

export default class ChatConnection{

    constructor(url){
        this.url = url;
    }
    
    /**
     * Establishes a connection to the server and logs
     * in the user.
     * @param {String} username
     * @event nameError - when the username is taken or invalid
     * @event welcome - when the user has successfully connected. 
     * @event message - emitted when a message is received.  
     * @event serverDisconnect -- emitted when the server disconnects the user
     */

    connect = (username) => {
        this.username = username;
        this.socket =  openSocket(this.url);
        this.socket.emit('login',{senderUsername: username});
        this.socket.on('name-error',this.onNameError);
        this.socket.on('welcome',this.onWelcome);
        this.socket.on('message',this.onMessage);
        this.socket.on('disconnect',this.onServerDisconnect);
        

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