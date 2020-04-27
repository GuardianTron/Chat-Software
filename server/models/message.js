class Message{
    /** 
     *  @property fromSocketId {String} -- sender socket id
     *  @property senderUsername {String} -- the sender's username
     *  @property type {String} -- type of message
     *  @property payload {any}  -- overridden by specific message types
     */
    constructor(type, {fromSocketId,senderUsername,channel,payload}){
        this.obj = {}
        this.obj.type = type;
        this.obj.channel = channel;
        this.obj.fromSocketId = fromSocketId;
        this.obj.senderUsername = senderUsername;
        this.obj.payload = payload; 
        this.obj.time = Date.now();
        
    }

 

    set fromSocketId(id){
        this.obj.fromSocketId = id;
    }

    get fromSocketId(){
        return this.obj.fromSocketId;
    }

    get payload(){
        return this.obj.payload;
    }

    get channel(){
        return this.obj.channel;
    }

    set payload(payload){
        this._payload = payload;
    }

    toJSON(){
        /*
         * Allow properties attached directly 
         * to instance to be attached to message 
         * object.
         */
        Object.keys(this).map(key =>{
            //don't attach internal object ot itself or 'private' attributes
            if(key !== 'obj' && key[0] !== '_'){
                this.obj[key] = this[key];
            }
        });

        return this.obj;
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
        super(PrivateMessage.IMAGE,data);
    }
}

module.exports.PrivateMessage = PrivateMessage;
module.exports.PrivateTextMessage = PrivateTextMessage;
module.exports.PrivateImageMessage = PrivateImageMessage;