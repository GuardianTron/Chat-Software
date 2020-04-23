import React,{Component} from 'react';
import MessageWindow from "./MessageWindow";
import UserList from "./UserList";

export default class ChatRoom extends Component{

    render(){
        const {userList,messages,messageHandler,imageHandler,launchPMWindow} = this.props;
        return <div className="chat-room">
                <UserList userList={userList} launchPMWindow={launchPMWindow} />
                <MessageWindow messageHandler={messageHandler} imageHandler={imageHandler} messages={messages} />    
            </div>;
    }

}