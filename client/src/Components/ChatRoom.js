import React, {Component} from 'react';

export default class ChatForm extends Component{

    state = {
        message: ''
    }

    constructor(props){
        super(props);
        this.messageWindowRef = React.createRef();
        this.inputRef = React.createRef();
    }
    render(){
        const messages = this.props.messages;
        return <>
        <ul className="message-window" ref={this.messageWindowRef}>
            {messages.map((message,index) =>{
                console.log(message);
                return <li key={index}>{message.username}: {message.message}</li>;
            })
        }
            
        </ul>
        <form onSubmit={this.onsubmit}>
            <p>
                <input type="text" onChange={this.onchange} value={this.state.message} ref={this.inputRef}/>
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
        this.inputRef.current.focus();
        
    }

    componentDidUpdate(prevProps,prevState,snapshot){
        this.messageWindowRef.current.scrollTo(0,this.messageWindowRef.current.scrollHeight);
    }


}