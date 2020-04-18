const {ChatMessage,ImageMessage} = require('./message');

module.exports.chatMessageRouter = function(chatServer,data){
    chatServer.sendMessageToChatroom((new ChatMessage(data)).toJSON());
}

module.exports.imageMessageRouter = function(chatServer,data){
    chatServer.sendMessageToChatroom((new ImageMessage(data)).toJSON());
}
