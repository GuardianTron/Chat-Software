const {ChatMessage, ImageMessage,UserErrorMessage, PrivateImageMessage, PrivateTextMessage} = require("./message");
const {ImageModel} = require("./Image");
const {UserError} = require("./error");

class MessageFilter{

    /**
     * Allows chat server to be attached in 
     * case data from server such as user data
     * is needed to for message validation. 
     * @param {ChatServer} chatServer 
     */
    attachServer(chatServer){
        this.chatServer = chatServer; 
    }

    filter(data){
     
    }
}



class TextMessageFilter extends MessageFilter{

    constructor(maxLength){
        super();
        this.maxCharLength = maxLength;
    }

    filter(data){
        super.filter(data);
        if(data.payload.length > this.maxCharLength){
           throw new UserError(`Messages must be no more than ${this.maxCharLength} characters in length.`);
        }
    }


}

class ImageMessageFilter extends MessageFilter{

    constructor(maxWidth,maxHeight,maxSizeBytes){
       super();
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.maxSizeBytes = maxSizeBytes;
    }

    async filter(data){
        super.filter(data);
        try{
            const processor = new ImageModel(data.payload.buffer,this.maxWidth,this.maxHeight,this.maxSizeBytes);
            const buffer = await processor.toPng()
            data.payload.buffer = buffer;
            data.payload.type = "image/png";
           
        }
        catch(error){
            //make sure error is reported back to user
            if(!(error instanceof UserError) ){
                throw new UserError('The submitted image format is not support.');
            }
            else{
                throw error;
            }
        }
    }
    
}


/**
 * @class PrivateMessageUserFilter
 * Makes sure that the receiving user has a valid
 * socket and that the username matches the provided socket id.
 * Note: Socket id's and usernames are only valid during the receiving user's session.
 * This is to prevent users from sending messages to logged off users by mistake,
 * as well as to prevent new users who are using a prior username or socket from getting
 * someone else' messages.
 *  
 */
class PrivateMessageUserFilter extends MessageFilter{

    filter(data){
        super.filter (data);
        try{
            //makes sure username matches the socket
            if(this.chatServer.users.getUsernameBySocketId(data.toSocketId) !== data.toUsername){
                throw new UserError(`An error occurred finding ${data.toUsername}`);
            }
        }
        catch(error){
            //no socket id found
            throw new UserError(`${$data.toUsername} appears to have logged off.`);
        }
    }


}


module.exports.MessageFilter = MessageFilter;
module.exports.TextMessageFilter = TextMessageFilter;
module.exports.ImageMessageFilter = ImageMessageFilter;
module.exports.PrivateMessageUserFilter = PrivateMessageUserFilter;