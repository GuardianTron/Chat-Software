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

    toJSON = () =>{
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
Message.NAME_ERROR = "name-error";
Message.IMAGE_ERROR = "image-error";

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

module.exports.Message = Message;
module.exports.ChatMessage = ChatMessage;
module.exports.ImageMessage = ImageMessage;