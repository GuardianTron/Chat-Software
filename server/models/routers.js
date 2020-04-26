const {ChatMessage,ImageMessage,PrivateImageMessage,PrivateTextMessage} = require('./message');

module.exports.chatMessageRouter = function(chatServer,data){
    chatServer.sendMessageToChatroom((new ChatMessage(data)).toJSON());
}

module.exports.imageMessageRouter = function(chatServer,data){
    chatServer.sendMessageToChatroom((new ImageMessage(data)).toJSON());
}

module.exports.privateTextMessageRouter = function(chatServer,data){
    chatServer.sendPrivateMessage((new PrivateTextMessage(data)).toJSON());
}

module.exports.privateImageMessageRouter = function(chatServer,data){
    chatServer.sendPrivateMessage((new PrivateImageMessage(data)).toJSON());
}
