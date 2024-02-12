

// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useParams } from 'react-router-dom';

// import { MessageState, Message, addMessage } from '../Redux/Store/messageSlice';
// import { signalRService } from '../Redux/Services/signalRService';

// export interface SendMessageProps {
//   setCurrentConversationId: (conversationId: string) => void;
// }

// const SendMessage: React.FC<SendMessageProps> = ({ setCurrentConversationId }) => {
//   const { conversationId } = useParams<{ conversationId: string }>();
//   const [messageContent, setMessageContent] = useState('');
//   const dispatch = useDispatch();
//   const messages = useSelector((state: { message: MessageState }) => state.message.messages);
// console.log('conversation id from send message', conversationId)
//   useEffect(() => {
//     setCurrentConversationId(conversationId ?? '');
//   }, [conversationId, setCurrentConversationId]);

//   const sendMessage = async () => {
//     if (messageContent) {
//       await signalRService.sendMessage(conversationId ?? '', messageContent);

//       const myMessage: Message = {
   
//         conversationId: conversationId ?? '',
//         messageContent: messageContent,
//         message: messageContent
//       }

//       dispatch(addMessage(myMessage));
//       setMessageContent('');
//     }
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         value={messageContent}
//         onChange={e => setMessageContent(e.target.value)}
//       />
//       <button onClick={sendMessage}>Send Message</button>
     
//     </div>
//   );
// };

import React, { useState } from 'react';
import { SendMessageProps, useMessages } from '../Messages/useMessages';

import { useParams } from 'react-router-dom';
import { Message, addMessage } from '../Redux/Store/messageSlice';
import { useDispatch } from 'react-redux';

const SendMessage: React.FC<SendMessageProps> = ({ setCurrentConversationId }) => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { sendMessage: send, messages } = useMessages(conversationId ?? '');
  const [messageContent, setMessageContent] = useState('');
  const dispatch = useDispatch();

  const sendMessage = async () => {
    if (messageContent) {
      await send(messageContent);

      const myMessage: Message = {
        conversationId: conversationId ?? '',
        messageContent: messageContent,
        message: messageContent,
      //  senderName: latestMessage?.senderName
      }

      dispatch(addMessage(myMessage));
      setMessageContent('');
    }
  };

  return (
    <div>
      {/* Display the messages */}
      {messages.map((message, index) =>
        <div key={index}>
          <p><strong>Sender:</strong> {message.senderName}</p>
          <p><strong>Message:</strong> {message.messageContent}</p>
        </div>
      )}
  
      {/* Input field to send a new message */}
      <input 
        type="text" 
        value={messageContent} 
        onChange={(e) => setMessageContent(e.target.value)} 
      />
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
};

export default SendMessage;