import React,{Component} from 'react';

export default class UserList extends Component{

    render(){
        const {userList} = this.props; 
        return <ul className="user-list">
           {Object.keys(userList).map((username) =>{
               return <li key={userList[username]}>{username}</li>
            })
            }
        </ul>;
    }
}