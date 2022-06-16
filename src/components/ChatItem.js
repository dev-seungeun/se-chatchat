import React from "react";
import { _authGetCurrentUser } from "../helpers/auth";
import { _commonTimestampToDate } from "../helpers/common";

class ChatItem extends React.Component {
    render() {
        return(
            <li className={this.props.chat.uid === _authGetCurrentUser().uid ? 'right' : 'left'}>
              {
                this.props.theme == "dark" ? <div className = "sender"><span>{'C:\\Users\\'+this.props.chat.email}</span></div>
                                           : <div className = "time"><span>{_commonTimestampToDate(this.props.chat.timestamp)}</span></div>
              }
              {
                this.props.theme == "dark" ? <div className = "time"><span>{_commonTimestampToDate(this.props.chat.timestamp)}</span></div>
                                           : <div className = "sender"><span>{this.props.chat.email}</span></div>
              }
              <div className = "message">
              { this.props.chat.message.includes("image_send_check")
                ? ( this.props.theme == "dark" ? <span className="msg_img" id={'img_id_'+this.props.chat.message.split(":")[1]} onClick={this.props.openImageModal}><span className="msg_img_span">{this.props.chat.imgUrl}</span>#사진#<br/></span>
                                               : <img className="msg_img" id={'img_id_'+this.props.chat.message.split(":")[1]} onClick={this.props.openImageModal} src={this.props.chat.imgUrl} /> )
                : ( this.props.chat.message.includes("\n")
                       ? this.props.chat.message.split("\n").map((line, index) => {
                           return <span key={index}>{line}<br/></span>
                         })
                       : <span>{this.props.chat.message}<br/></span> )
              }
                </div>
            </li>
        );
    }
}

export default ChatItem;
