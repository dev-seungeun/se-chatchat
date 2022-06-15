import React from "react";
import { authService } from "../services/firebase";

class ChatItem extends React.Component {
    render() {
        return(
            <li className={this.props.chat.uid === authService.currentUser.uid ? 'right' : 'left'}>
              {
                this.props.theme == "dark" ? <div className = "sender"><span>{'C:\\Users\\'+this.props.chat.email}</span></div>
                                           : <div className = "time"><span>{toDate(this.props.chat.timestamp)}</span></div>
              }
              {
                this.props.theme == "dark" ? <div className = "time"><span>{toDate(this.props.chat.timestamp)}</span></div>
                                           : <div className = "sender"><span>{this.props.chat.email}</span></div>
              }
              <div className = "message">
              { this.props.chat.message.includes("image_send_check")
                ? <img className="msg_img" id={'img_id_'+this.props.chat.message.split(":")[1]} onClick={this.props.openImageModal} src={this.props.chat.imgUrl} />
                : this.props.chat.message.includes("\n")
                      ? this.props.chat.message.split("\n").map(line => {
                          <span>{line}<br/></span>
                        })
                      : <span>{this.props.chat.message}<br/></span>
              }
                </div>
            </li>
        );
    }
}

function toDate(timestamp) {
  //let date = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timestamp);
  let date = new Intl.DateTimeFormat('ko-KR', {  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(timestamp);
  return date;
}

export default ChatItem;
