const {ChatMessage, ImageMessage,UserErrorMessage} = require("./message");
const {ImageModel} = require("./Image");
const {UserError} = require("./error");

class MessageHandler{


    attachServer(chatServer){
        this.chatServer = chatServer;
    }

    handle(data){
        if(!this.chatServer){
            throw new Error("Must attach a valid instance of ChatServer");
        }
    }
}



class ChatMessageHandler extends MessageHandler{

    constructor(maxLength){
        super();
        this.maxCharLength = maxLength;
    }

    handle(data){
        super.handle(data);
        if(data.payload.length > this.maxCharLength){
            data.payload = `Messages must be no more than ${this.maxCharLength} characters in length.`;
            this.chatServer.sendErrorToUser(data.fromSocketId,(new  UserErrorMessage(data)).toJSON());

        }
        else{
            this.chatServer.sendMessageToChatroom((new ChatMessage(data)).toJSON());
        }
    }
}

class ImageMessageHandler extends MessageHandler{

    constructor(maxWidth,maxHeight,maxSizeBytes){
       super();
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.maxSizeBytes = maxSizeBytes;
    }

    handle(data){
        super.handle(data);
        try{
            const processor = new ImageModel(data.payload.buffer,this.maxWidth,this.maxHeight,this.maxSizeBytes);
            processor.toPng()
            .then((buffer) =>{
                data.payload.buffer = buffer;
                data.type = "image/png";
                this.chatServer.sendMessageToChatroom((new ImageMessage(data)).toJSON());
            })
            .catch((error) => {
                if(error instanceof UserError)
                    this.chatServer.sendErrorToUser(data.fromSocketId,error.message);
                this.chatServer.handleError(error);
            
            });

        }
        catch(error){
            
            if(error instanceof UserError) this.chatServer.sendErrorToUser(data.fromSocketId,(new UserErrorMessage(error.message).toJSON()));
            this.chatServer.handleError(error);
        }
    }
}

module.exports.MessageHandler = MessageHandler;
module.exports.ChatMessageHandler = ChatMessageHandler;
module.exports.ImageMessageHandler = ImageMessageHandler;