import React, {Component} from 'react';

class MessageWindow extends Component{

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
        
        
        return <div className="message-window">
        <ul  ref={this.messageWindowRef}>
            {messages.map((message,index) =>{
                console.log(message);
                return <li key={message.time}><Message content={message}/></li>;
            })
        }
            
        </ul>
        <form onSubmit={this.onsubmit}>
            <p>
                <input type="text" onChange={this.onchange} value={this.state.message} ref={this.inputRef}/>
                <button type="submit">Send Message</button>
            </p>
            <p>
                
                <input type="file" onChange={this.onselectFile}/>
            </p>
        </form>
        </div>;
    }

    onchange = event =>{
        this.setState({message: event.target.value});
    }

    onselectFile = event =>{
        console.log(event.target.files[0]);
        const imageFile = event.target.files[0];
        const reader = new FileReader();
        try{
            reader.readAsArrayBuffer(imageFile);
            reader.onload = event => {
                this.props.imageHandler(reader.result,imageFile.type);
            };
        }
        catch(error){
            alert(error.message);
        }
    
    }

    onsubmit = event =>{
        event.preventDefault();
        this.props.messageHandler(this.state.message);
        this.setState({message: ""});
        this.inputRef.current.focus();
        
    }

    componentDidUpdate(prevProps,prevState,snapshot){
        this.messageWindowRef.current.scrollTo(0,this.messageWindowRef.current.scrollHeight);
    }


}

export default MessageWindow;

const Message = ({content}) =>{
    if(content.type === "image"){
        return <>{content.senderUsername}:<DownloadedImage buffer={content.payload.buffer} type={content.payload.type} /></>;
    }
    else if(content.type === "server-announcement"){
        return <div className="server-announcement">{content.payload}</div>
    }
    else{
        return <>{content.senderUsername}: <ParsedMessage content={content.payload} /></>; 
    }
}

const DownloadedImage = props =>{
    const {buffer,type} = props;
    const blob = new Blob([new Uint8Array(buffer)],{type: type});
    return <img src={URL.createObjectURL(blob)}/>;
}

const ParsedMessage = ({content}) =>{
    
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
            contentParts.push(<a href={scheme+escape(remainder)} target="_blank" rel="noopener noreferrer">{url}</a>);
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