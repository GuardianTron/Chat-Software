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
                return <li key={index}>{message.username}: <WrapLinks content={message.message}/></li>;
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

const WrapLinks = ({content}) =>{
    const contentParts = [];
    const linkRegex = /(https?:\/\/|www\.)(\S+)/ig;

    if(!content.match(linkRegex)){
        return <>{content}</>;
    }
    //replace urls with links
    let nextIndex = 0;
    for(let match of content.matchAll(linkRegex)){
        let url = match[0];
        let scheme = match[1];
        let remainder = match[2];
        

        //make sure links are external in case of wwww
        if(scheme === "www."){
            remainder = scheme+remainder;
            scheme="http://";
        }

        contentParts.push(content.substring(nextIndex,match.index));
        nextIndex = match.index + url.length;
        /*
         * Only make url into link if valid
         * scheme+remainder is used to preserve 
         * url text in case that url submitted did not have a
         * scheme.
         */
        try{
            new URL(scheme+remainder);
            contentParts.push(<a key={match.index.toString()} href={scheme+escape(remainder)} target="_blank" rel="noopener noreferrer">{url}</a>);
        }
        catch(e){
            //add url back in without wrapping in link
            contentParts.push(url);
        }
    }
    //add the last text portion of the content
    contentParts.push(content.substring(nextIndex));
    return <>{contentParts}</>;

}