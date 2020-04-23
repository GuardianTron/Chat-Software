import React from 'react';
import './App.css';


import LoginForm from "./Components/LoginForm";
import ChatRoom from "./Components/ChatRoom";
import PrivateMessageWindow from "./Components/PrivateMessageWindow"; 

import ChatConnection from "./Backend/networking";

class App extends React.Component {

  
  
  state={
    username: '',
    online: false,
    message: '',
    users: {},
    texts: [],
    pms: {}
  };

  constructor(props){
    super(props);
    this.chatConnection = new ChatConnection("http://localhost:3001");
    this.chatConnection.onUserError = this.handleUserError;
    this.chatConnection.onMessage = this.handleMessage;
    this.chatConnection.onPrivateMessage = this.handlePrivateMessage;
    this.chatConnection.onWelcome = this.handleWelcome;
    this.chatConnection.onUpdateUserList = this.handleUpdateUserList;
    this.chatConnection.onServerDisconnect = this.handleServerDisconnect;

  }
  
  render(){
    return (
      <div className="App">
        {this.state.online?
         <ChatRoom userList={this.state.users} messageHandler={this.chatConnection.sendChatText} imageHandler={this.chatConnection.sendChatImage} messages={this.state.texts}/>:
         <LoginForm handleConnection={this.chatConnection.connect} message={this.state.message}/>
         }

      </div>
    );
  }

  componentWillUnmount(){
    this.chatConnection.disconnect();
  }

  handleUserError = (data) => {
    this.setState({message: data.payload});
  }

  handleMessage = (data) => {
    console.log("received");
    this.setState({texts:[...this.state.texts,data]});
  }

  handlePrivateMessage = (data) =>{
    this.__appendPrivateMessageToState(data.fromSocketId,data);
  }

  handleUpdateUserList = (data) =>{
    this.setState({users: data.payload});
  }

  handleWelcome = (data) => {
    this.setState({username: data.senderUsername, online: true});
  }

  sendMessage = message => {
    console.log(`Sending message: ${message}`);
    this.socket.emit('message',{senderUsername: this.state.username, payload:message});
  }

  sendImage = imageBuffer => {
    this.socket.emit('image',{senderUsername: this.state.username, payload: imageBuffer});
  }

  sendPrivateMessage = (message,toUsername) =>{
    const toSocketId = this.state.users[toUsername];
    //user may have logged off.  Do not send
    if(!toSocketId) return;
    const messageObj = this.chatConnection.sendPrivateText(message,toUsername,toSocketId);
    this.__appendPrivateMessageToState(messageObj.toSocketId,messageObj);

  }

  sendPrivateImage = (imageBuffer, imageType, toUsername) => {
    const toSocketId = this.state.username[toUsername];
    //user may have logged off.  Do not send
    if(!toSocketId) return;
    const messageObj = this.chatConnection.sendPrivateImage(imageBuffer,imageType,toUsername,toSocketId);
    this.__appendPrivateMessageToState(messageObj.toSocketId,messageObj);
  }

  handleServerDisconnect = ()=>{
    this.setState({online:false,texts:[]});
  }

  __appendPrivateMessageToState(destSocketId,data){
     const pms = this.state.pms;
     if(!pms.hasOwnProperty(destSocketId)){
       pms[destSocketId] = [];
     }
     pms[destSocketId].push(data);
     this.setState({pms: pms});
  }
}




export default App;
