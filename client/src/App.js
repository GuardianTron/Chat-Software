import React from 'react';
import './App.css';


import LoginForm from "./Components/LoginForm";
import ChatRoom from "./Components/ChatRoom";
import UserList from "./Components/UserList";

import ChatConnection from "./Backend/networking";

class App extends React.Component {

  
  
  state={
    username: '',
    online: false,
    message: '',
    users: {},
    texts: []
  };

  constructor(props){
    super(props);
    this.chatConnection = new ChatConnection("http://localhost:3001");
    this.chatConnection.onUserError = this.handleUserError;
    this.chatConnection.onMessage = this.handleMessage;
    this.chatConnection.onWelcome = this.handleWelcome;
    this.chatConnection.onUpdateUserList = this.handleUpdateUserList;
    this.chatConnection.onServerDisconnect = this.handleServerDisconnect;

  }
  
  render(){
    return (
      <div className="App">
        {this.state.online?
         <><UserList userList={this.state.users} /><ChatRoom messageHandler={this.chatConnection.sendChatText} imageHandler={this.chatConnection.sendChatImage} messages={this.state.texts}/></>:
         <LoginForm handleConnection={this.chatConnection.connect} message={this.state.message}/>
         }
      </div>
    );
  }

  componentWillUnmount(){
    this.chatConnection.disconnect();
  }
  /*
  connect = (username) =>{
    this.socket = openSocket("http://localhost:3001");
    
    const message = {senderUsername: username};
    console.log(message);
    this.socket.emit('login',message);
    
    this.socket.on('name-error',(data) =>{
      this.setState({message: data.payload});
    });

    this.socket.on('message',data =>{
      this.setState({texts:[...this.state.texts,data]});
    });

    this.socket.on('image',data =>{
      console.log('image message',data);
      this.setState({texts:[...this.state.texts,data]});
    });

    this.socket.on('welcome',(data)=>{
      console.log(data);
      this.setState({username: data.senderUsername, online: true});
    
    });
 
    
  }
  */

  handleUserError = (data) => {
    this.setState({message: data.payload});
  }

  handleMessage = (data) => {
    console.log("received");
    this.setState({texts:[...this.state.texts,data]});
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

  handleServerDisconnect = ()=>{
    this.setState({online:false,texts:[]});
  }
}




export default App;
