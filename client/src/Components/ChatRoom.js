import React,{Component} from 'react';
import MessageWindow from "./MessageWindow";
import UserList from "./UserList";

export default class ChatRoom extends Component{

    render(){
        const {userList,messages,messageHandler,imageHandler} = this.props;
        return <div className="chat-room">
                <UserList userList={userList} />
                <MessageWindow messageHandler={messageHandler} imageHandler={imageHandler} messages={messages} />    
            </div>;
    }

}