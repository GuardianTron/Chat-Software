import openSocket from "socket.io-client";


export default class ChatConnection{

    constructor(url){
        this.url = url;
    }
    /**
     * Retrieve configuration information
     * for validation from the server.
     */
    getValidationInfo = () =>{
        this.socket = openSocket(this.url);
        this.socket.emit('validation-info',null);
        this.socket.on('validation-info',(data ) => {
            this.validationInfo = data;
            this.socket.removeAllListeners('validation-info');
            this.socket.close();
            this.imageValidation = this.validationInfo.type.image.pop();
            this.messageValidation = this.validationInfo.type.message.pop();
            console.log(this.messageValidation,this.imageValidation);
            this.usernameValidation = this.validationInfo.username;
        });
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
        this.validateMessage(message);
        const messageObj = this.__createBasicMessageObj();
        messageObj.type = "message";
        messageObj.payload = message;
        this.send(messageObj);
        return messageObj;

    }

    sendChatImage = (imageBuffer, imageMimeType) => {
        this.validateImage(imageBuffer,imageMimeType);
        const messageObj = this.__createBasicMessageObj();
        messageObj.type = "image";
        messageObj.payload = {mime: imageMimeType, buffer: imageBuffer};
        this.send(messageObj);
        return messageObj;
        
    }

    sendPrivateText = (message,toUsername,toSocketId) => {
        this.validateMessage(message);
        const messageObj = this.__createBasicPrivateMessageObj();
        messageObj.type = "message";
        messageObj.toUsername = toUsername;
        messageObj.toSocketId = toSocketId;
        messageObj.payload = message;
        this.sendPM(messageObj);
        console.log(messageObj);
        return messageObj;

    }

    /**
     * Sends an image via private message.
     * 
     * @param {Buffer} imageBuffer -- binary buffer of the image
     * @param {String} imageMimeType -- mime type string
     * @param {String} toUsername 
     * @param {String} toSocketId
     * @returns {Object} 
     * @throws Error -- if the image is too large or not a valid mime type
     */

    sendPrivateImage(imageBuffer,imageMimeType,toUsername,toSocketId){
        const messageObj = this.__createBasicPrivateMessageObj();
        this.validateImage(imageBuffer,imageMimeType);
        messageObj.type = 'image';
        messageObj.toUsername = toUsername;
        messageObj.toSocketId = toSocketId;
        messageObj.payload = {mime: imageMimeType,buffer: imageBuffer};
        this.sendPM(messageObj);
        return messageObj;
    }

    /**
     * 
     * @param {ArrayBuffer} imageBuffer 
     * @param {String} imageMimeType 
     * @throws {Error} 
     */

    validateImage(imageBuffer,imageMimeType){
        if(imageBuffer.length > this.imageValidation.maxSizeBytes){
            throw new Error(`Images may be no larger than ${this.imageValidation.maxSizeBytes/(8*Math.pow(2,20))} MB`);
        }
        else if(!this.imageValidation.allowedMimes.includes(imageMimeType)){
            throw new Error(`Images of type: ${imageMimeType} are not allowed.`);
        }

    }

    validateMessage(message){
        const minLength = this.messageValidation.minCharLength;
        const maxLength = this.messageValidation.maxCharLength;
        if(message.length < minLength) throw new Error("Please enter a message.");
        else if(message.length > maxLength) throw new Error(`Messages must may only be ${maxLength} characters long.`);
    }
    



}