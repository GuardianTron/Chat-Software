import React from 'react';
import './App.css';

import LoginForm from "./Components/LoginForm";

class App extends React.Component {

  socket = null;
  state={
    username: '',
    online: false
  };
  
  render(){
    return (
      <div className="App">
        {this.state.online || <LoginForm handleConnection={this.connect} />}
      </div>
    );
  }

  connect = (socket,username) =>{
    this.socket = socket;
    this.setState({username: username, online: true});
  }
}




export default App;
