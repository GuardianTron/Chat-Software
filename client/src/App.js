import React from 'react';
import openSocket from "socket.io-client";
import './App.css';


import LoginForm from "./Components/LoginForm";

class App extends React.Component {

  socket = null;
  state={
    username: '',
    online: false,
    message: ''
  };
  
  render(){
    return (
      <div className="App">
        {this.state.online || <LoginForm handleConnection={this.connect} message={this.state.message}/>}
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

    this.socket.on('welcome',(data)=>{
      console.log(data);
      this.setState({username: data.username, online: true});
    
    });
 
    
  }
}




export default App;
