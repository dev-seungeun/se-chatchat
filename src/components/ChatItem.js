import React from "react";
import { Link  } from "react-router-dom";
import { _authGetCurrentUser } from "../helpers/auth";
import { _commonTimestampToDate } from "../helpers/common";
import { _parseUrlLink } from "../helpers/parseUrlLink";

function getChateItem(props) {
  if(props.theme == "dark") {
    return <li>
             <div className="sender"><span>{"C:\\Users\\"+props.chat.email}</span></div>
             <div className="time"><span>{_commonTimestampToDate(props.chat.timestamp)+" >"}</span></div>
             <div className="message" id={props.chat.timestamp} onContextMenu={(e)=>props.handleMsgRightClick(e, props.chat)}>
                { props.chat.reply && <span className="msg_reply" onClick={(e)=>props.goToReplyMsg(e, props.chat.reply.split("-")[1])}>{props.chat.reply.split("-")[0]+"님에게 답장 > ["+props.chat.reply.split("-")[2]+"]"}</span> }
                { props.chat.message.includes("image_send_check")
                      ? <span className="msg_img" id={"img_id_"+props.chat.message.split(":")[1]} onClick={props.openImageModal}><span className="msg_img_span">{props.chat.imgUrl}</span>#사진#<br/></span>
                      : props.chat.message.includes("\n")
                            ? props.chat.message.split("\n").map((line, index) => {
                                return <span key={index}>{_parseUrlLink(line)}<br/></span>
                              })
                            : <span>{_parseUrlLink(props.chat.message)}</span>
                }
             </div>
           </li>
  }else {
    return <li className={props.chat.uid === _authGetCurrentUser().uid ? "right" : "left"}>
             <div className="time"><span>{_commonTimestampToDate(props.chat.timestamp)}</span></div>
             <div className="sender"><span>{props.chat.email}</span></div>
             <div className="message" id={props.chat.timestamp} onContextMenu={(e)=>props.handleMsgRightClick(e, props.chat)}>
                { props.chat.reply && <span className="msg_reply" onClick={(e)=>props.goToReplyMsg(e, props.chat.reply.split("-")[1])}>{props.chat.reply.split("-")[0]+"님에게 답장"}<br/><span>{"["+props.chat.reply.split("-")[2]+"]"}</span><br/></span> }
                { props.chat.message.includes("image_send_check")
                      ? <img className="msg_img" id={"img_id_"+props.chat.message.split(":")[1]} onClick={props.openImageModal} src={props.chat.imgUrl} />
                      : props.chat.message.includes("\n")
                            ? props.chat.message.split("\n").map((line, index) => {
                                return <span key={index}>{_parseUrlLink(line)}<br/></span>
                              })
                            : <span>{_parseUrlLink(props.chat.message)}</span>
                }
             </div>
           </li>
  }
}
class ChatItem extends React.Component {
    render() {
        return getChateItem(this.props);
    }
}

export default ChatItem;
