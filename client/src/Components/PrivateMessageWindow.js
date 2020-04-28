import React, { Component } from 'react';
import MessageWindow from './MessageWindow';

export default class PrivateMessageWindow extends Component {

    state = {
        beingDragged: false,
        mouseOffset: { x: 0, y: 0 },
        collapsed: false,
        closed: false,
        toUsername: ""
    }

    constructor(props) {
        super(props);
        this.windowRef = React.createRef();

        this.mouseOffset = { x: 0, y: 0 };
    }

    componentDidUpdate(prevProps,prevState,snapshot){
        /*
         * Open closed window if new message is 
         * received.  This occurs if
         * either the lastUpdate prop is defined 
         * for the first time or if the lastUpdate 
         * prop has increased
         */
        if(this.state.closed && ((!prevProps.lastUpdate && this.props.lastUpdate) || prevProps.lastUpdate < this.props.lastUpdate )){
            this.setState({closed: false});
        }
        console.log('Update Status:',prevProps.lastUpdate,this.props.lastUpdate);
    }


    render() {

        //send empty fragment if closed
        if(this.state.closed) return <></>;
        const pmTextSender = (message) =>{
            const toUsername = this.props.username;
            this.props.messageHandler(message,toUsername);
        }

        const pmImageSender = (imageBuffer,imageType) => {
            const toUsername = this.props.username;
            this.props.imageHandler(imageBuffer,imageType,toUsername);
        }
 
        let messageWindow = <></>;
        if(!this.state.collapsed){
            messageWindow = <MessageWindow {...this.props} messageHandler={pmTextSender} imageHandler={pmImageSender} />; 
        }

        return <div className="private-message-window" ref={this.windowRef} onMouseDown={this.startDrag} >
            <header><h2>{this.props.username}</h2><span onClick={this.toggleCollapsed}>-</span><span onClick={this.handleClose}>x</span></header>
            {messageWindow}
        </div>;
    }

    startDrag = (event) => {

        const element = this.windowRef.current;
        let node = element;


        element.style.position = "absolute";
        const rect = element.getBoundingClientRect();
        const mouseOffset = {};
        mouseOffset.x = event.clientX - rect.left;
        mouseOffset.y = event.clientY - rect.top;
        this.setState({ beingDragged: true, mouseOffset: mouseOffset });
        const parent = this.windowRef.current.parentElement;
        parent.addEventListener('mousemove', this.onDrag);
        parent.addEventListener('mouseleave', this.onStop);
        parent.addEventListener('mouseup', this.onStop);
    }

    onDrag = (event) => {
        //event.preventDefault();
        const style = this.windowRef.current.style;
        const mouseOffset = this.state.mouseOffset;
        style.top = event.pageY - mouseOffset.y + "px";
        style.left = event.pageX - mouseOffset.x + "px";

    }

    onStop = (event) => {
        this.setState({ beingDragged: false });
        //if statement prevents errors when server disconnects 
        if(this.windowRef.current){  
            const element = this.windowRef.current.parentElement;
            element.removeEventListener('mousemove', this.onDrag);
            element.removeEventListener('mouseup', this.onStop);
         }
    }



    toggleCollapsed = (event) => {
        const collapsed = !this.state.collapsed;
        this.setState({collapsed: collapsed});
    }

    handleClose = event => {
        this.setState({closed:true});
    }



}


