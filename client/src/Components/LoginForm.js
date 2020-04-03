import React, {Component} from 'react';


export default class LoginForm extends Component{

    render(){
        return <form onSubmit={this.connect}>
            <p>
                <label htmlFor="username">User Name: </label>
                <input type="text" id="username" name="username" />
            </p>
            <p>
                <button type="submit">Connect</button>
            </p>
        </form>;
    }

    connect = (event) =>{
        event.preventDefault();
        this.props.handleConnection();

    }
}