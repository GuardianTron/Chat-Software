import React, { Component } from 'react';
import MessageWindow from './MessageWindow';

export default class PrivateMessageWindow extends Component {

    state = {
        beingDragged: false,
        mouseOffset: {x: 0, y: 0},
        collapsed: false,
        toUsername: ""
    }

    constructor(props) {
        super(props);
        this.windowRef = React.createRef();

        this.mouseOffset = { x: 0, y: 0 };
    }

    componentDidMount() {
        console.log(this.windowRef.current.parentElement);
    }
    render() {

        return <div className="private-message-window" ref={this.windowRef} onMouseDown={this.startDrag} >
            <header><h2>{this.props.username}</h2></header>
            <MessageWindow {...this.props} />
        </div>;
    }

    startDrag = (event) => {
       
        const element = this.windowRef.current;
        let node = element;
        

        element.style.position = "absolute";
        const rect = element.getBoundingClientRect();
        const mouseOffset= {};
        mouseOffset.x = event.clientX - rect.left;
        mouseOffset.y = event.clientY - rect.top;
        this.setState({beingDragged: true, mouseOffset: mouseOffset});
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
        this.setState({beingDragged: false});
        const element = this.windowRef.current.parentElement;
        element.removeEventListener('mousemove', this.onDrag);
        element.removeEventListener('mouseup', this.onStop);



    }


}