import React, {Component} from 'react';

export default class ChatForm extends Component{

    state = {
        message: ''
    }
    render(){
        const messages = this.props.messages;
        return <>
        <ul className="message-window" id="message-display">
            {messages.map((message,index) =>{
                console.log(message);
                return <li key={index}>{message.username}: {message.message}</li>;
            })
        }
            
        </ul>
        <form onSubmit={this.onsubmit}>
            <p>
                <input type="text" onChange={this.onchange} value={this.state.message}/>
                <button type="submit">Send Message</button>
            </p>
        </form>
        </>;
    }

    onchange = event =>{
        this.setState({message: event.target.value});
    }

    onsubmit = event =>{
        event.preventDefault();
        this.props.sendHandler(this.state.message);
        this.setState({message: ""});
        
    }

    componentDidUpdate(prevProps,prevState,snapshot){
        const messageWindow = document.getElementById("message-display");
        messageWindow.scrollTo(0,messageWindow.scrollHeight);
    }


}