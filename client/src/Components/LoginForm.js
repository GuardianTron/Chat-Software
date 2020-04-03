import React, {Component} from 'react';


export default class LoginForm extends Component{

    state = {
        username: '',
    }

    render(){
        return <form onSubmit={this.connect}>
            {this.props.message || <h2>{this.props.message}</h2>}
            <p>
                <label htmlFor="username">User Name: </label>
                <input type="text" id="username" name="username" onChange={this.onchange} />
            </p>
            <p>
                <button type="submit">Connect</button>
            </p>
        </form>;
    }

    onchange = event =>{
        this.setState( {username: event.target.value});
    }

    connect = (event) =>{
        event.preventDefault();
        this.props.handleConnection(this.state.username);

    }


}