import React from 'react';
import openSocket from "socket.io-client";
import './App.css';


import LoginForm from "./Components/LoginForm";
import ChatRoom from "./Components/ChatRoom";

class App extends React.Component {

  socket = null;
  state={
    username: '',
    online: false,
    message: '',
    texts: []
  };
  
  render(){
    return (
      <div className="App">
        {this.state.online?
         <ChatRoom sendHandler={this.sendMessage} messages={this.state.texts}/>:
         <LoginForm handleConnection={this.connect} message={this.state.message}/>
         }
      </div>
    );
  }

  connect = (username) =>{
    this.socket = openSocket("http://localhost:3001");
    const message = {username: username};
    console.log(message);
    this.socket.emit('login',{username: username});
    
    this.socket.on('name-error',(data) =>{
      this.setState({message: data.message});
    });

    this.socket.on('message',data =>{
   
      this.setState({texts:[...this.state.texts,data]});
    });

    this.socket.on('welcome',(data)=>{
      console.log(data);
      this.setState({username: data.username, online: true});
    
    });
 
    
  }

  sendMessage = message => {
    console.log(`Sending message: ${message}`);
    this.socket.emit('message',{username: this.state.username, message:message});
  }
}




export default App;
