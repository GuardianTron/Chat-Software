import React from 'react';
import logo from './logo.svg';
import './App.css';

import LoginForm from "./Components/LoginForm";

class App extends React.Component {

  stat={
    username: '',
    online: false
  };
  
  render(){
    return (
      <div className="App">
        <LoginForm />
      </div>
    );
  }
}

export default App;
