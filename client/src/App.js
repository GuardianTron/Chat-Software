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
    this.chatConnection.getValidationInfo();

  }
  
  render(){
    const chatRoomProps = {
      userList: this.state.users,
      messageHandler: this.sendMessage,
      imageHandler: this.sendImage,
      launchPMWindow: this.handleOpenPMWindow,
      messages: this.state.texts
    };
    return (
      <div className="App">
        {this.state.online?
          <>
          
           <ChatRoom {...chatRoomProps}/>
           {Object.values(this.state.pms).map(({lastUpdate, username,messages}) => {
             return <PrivateMessageWindow 
                    key={username}
                    username={username}
                    messages={messages}
                    lastUpdate={lastUpdate} 
                    messageHandler={this.sendPrivateMessage}
                    imageHandler={this.sendPrivateImage}
                     />
           })}
          </>:
         <LoginForm handleConnection={this.connect} message={this.state.message} />
         }

      </div>
    );
  }

  componentWillUnmount(){
    this.chatConnection.disconnect();
  }

  connect = (username) =>{
    this.setState({username: username})
    this.chatConnection.connect(username);
  } 

  handleUserError = (data) => {
    this.setState({message: data.payload});
  }

  handleMessage = (data) => {
    console.log("received");
    this.setState({texts:[...this.state.texts,data]});
  }

  handlePrivateMessage = (data) =>{
    console.log('PM',data);
    this.__appendPrivateMessageToState(data.senderUsername,data);
  }

  handleUpdateUserList = (data) =>{
    const {added,removed} = this.__diffUserList(this.state.users,data.payload);
    const pms = this.state.pms;
    removed.map(user=>{
      const socketId = this.state.users[user];
      if(pms.hasOwnProperty(socketId)){
        const message = this.chatConnection.__createBasicPrivateMessageObj();
        message.channel="server-announcement";
        message.payload=`${user} has left the chat.`;

        pms[socketId].messages.push(message);
      }
    });

    this.setState({users: data.payload,pms:pms});
  }

  handleWelcome = (data) => {
    console.log(data);
    this.setState({online: true});
  }

  sendMessage = message => {
    console.log(`Sending message: ${message}`);
    this.chatConnection.sendChatText(message);
  }

  sendImage = (imageBuffer,imageType) => {
    this.chatConnection.sendChatImage(imageBuffer,imageType);
  }

  sendPrivateMessage = (message,toUsername) =>{
    const toSocketId = this.state.users[toUsername];
    
    //user may have logged off.  Do not send
    if(!toSocketId) return;
    const messageObj = this.chatConnection.sendPrivateText(message,toUsername,toSocketId);
    this.__appendPrivateMessageToState(toUsername,messageObj);

  }

  sendPrivateImage = (imageBuffer, imageType, toUsername) => {
    const toSocketId = this.state.users[toUsername];
    //user may have logged off.  Do not send
    if(!toSocketId) return;
    const messageObj = this.chatConnection.sendPrivateImage(imageBuffer,imageType,toUsername,toSocketId);
    
    this.__appendPrivateMessageToState(toUsername,messageObj);
  }

  /**
   * Handler is a factory to generate onclick functions 
   * for each username to generate user windows.
   * @param (Sting) username
   * @return (Function)
   */
  handleOpenPMWindow = (username) => {

    return () =>{
      //don't pm yourself.
      if(this.state.username === username) return; 
      //render function spawns windows based on pm threads,
      //so adding one will spawn one for the 
      this.__appendPrivateMessageToState(username);
      
    }

  }

  handleServerDisconnect = ()=>{
    this.setState({online:false,texts:[]});
  }

  /**
   * Saves messages for each user into it's own 
   * private message array within the state.
   * Creates new entry if one does not exist.
   * Will add message data if any is given. 
   * @param {String} toUsername
   * @param {Object} data 
   */

  __appendPrivateMessageToState(toUsername,data = null){
    const pms = this.state.pms;
    const toSocketId = this.state.users[toUsername];
    if(!toSocketId) return;
    if(!pms.hasOwnProperty(toSocketId)){
      pms[toSocketId] = {username: toUsername, messages:[]};
    } 
    if(data){  
      pms[toSocketId].messages.push(data);
    }
    //allows all clicks to change time to allow message
    //window to know it should open if closed.
    pms[toSocketId].lastUpdate = Date.now();
    this.setState({pms: pms});
  }

  __diffUserList(oldList,newList){
    
    const oldUsers = Object.keys(oldList);
    const newUsers = Object.keys(newList);
    oldUsers.sort();
    newUsers.sort();

    let oldIndex = 0;
    let newIndex = 0;
    let added = [];
    let removed = [];

    while(oldIndex < oldUsers.length && newIndex < newUsers.length){
      
      let oldUser = oldUsers[oldIndex];
      let newUser = newUsers[newIndex];

      //user in both lists
      if(oldUser === newUser){
          oldIndex++;
          newIndex++;
      } 
      //old user not in new list  
      else if(oldUser < newUser){
        removed.push(oldUser);
        oldIndex++;
      }//new user added
      else{
        added.push(newUser);
        newIndex++;
      }

    }

    //get remaining
    if(oldIndex < oldUsers.length){
      removed = removed.concat(oldUsers.slice(oldIndex));
    }

    if(newIndex < newUsers.length ){
      added = added.concat(newUsers.slice(newIndex));
    }

    return {added,removed}; 


  }
}







export default App;
