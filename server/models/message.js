class Message{
    /** 
     *  @property fromSocketId {String} -- sender socket id
     *  @property senderUsername {String} -- the sender's username
     *  @property type {String} -- type of message
     *  @property payload {any}  -- overridden by specific message types
     */
    constructor(type, {fromSocketId,senderUsername,payload}){
        this.type = type;
        this._fromSocketId = fromSocketId;
        this.senderUsername = senderUsername;
        this.payload = payload; 
        this.time = Date.now();
        
    }

 

    set fromSocketId(id){
        this._fromSocketId = id;
    }

    get fromSocketId(){
        return this._fromSocketId;
    }

    get payload(){
        return this._payload;
    }

    set payload(payload){
        this._payload = payload;
    }

    toJSON(){
        const json = {
            fromSocketId: this.fromSocketId,
            senderUsername: this.senderUsername,
            type: this.type,
            payload: this._payload,
            time: this.time
        };
        return json;
    }

    
        

}


Message.MESSAGE = 'message';
Message.WELCOME = "welcome";
Message.IMAGE = "image";
Message.LOGIN = "login";
Message.DISCONNECT = "disconnect";
Message.USER_ERROR = "user-error";
Message.SERVER_ANNOUNCEMENT = "server-announcement";

class ChatMessage extends Message{
    constructor(data){
        super(Message.MESSAGE,data);
    }

}

class ImageMessage extends Message{
    constructor(data){
        super(Message.IMAGE,data);
    }
}

class UserErrorMessage extends Message{
    constructor(data){
        super(Message.USER_ERROR,data);
    }

}



class ServerMessage extends Message{
    constructor(type,data){
        data.senderUsername = null;
        data.fromSocketId = null;
        super(type,data);
    }
}

class ServerAnnouncementMessage extends ServerMessage{
    constructor(data){
        super(Message.SERVER_ANNOUNCEMENT,data);
    }
}

module.exports.Message = Message;
module.exports.ChatMessage = ChatMessage;
module.exports.ImageMessage = ImageMessage;
module.exports.ServerAnnouncementMessage = ServerAnnouncementMessage;

class PrivateMessage extends Message{
     
    constructor(type,data){
        super(type,data);
        this._toSocketId = data.toSocketId;
        this._toUsername = data.toUsername;
        
    }

    get toSocketId(){
        return this._toSocketId;
    }
    get toUsername(){
        return this._toUsername;
    }

    toJSON(){
        const json = super.toJSON();
        json.toSocketId = this.toSocketId;
        json.toUsername = this.toUsername;
        return json;
    }
}

PrivateMessage.MESSAGE = "private-message";
PrivateMessage.IMAGE = "private-image";

class PrivateTextMessage extends PrivateMessage{
    constructor(data){
        super(PrivateMessage.MESSAGE,data);
    }
}

class PrivateImageMessage extends PrivateMessage{
    constructor(data){
        super(PrivateMessage.PrivateImageMessage);
    }
}

module.exports.PrivateMessage = PrivateMessage;
module.exports.PrivateTextMessage = PrivateTextMessage;
module.exports.PrivateImageMessage = PrivateImageMessage;