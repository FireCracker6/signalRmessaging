

// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import * as signalR from '@microsoft/signalr';
// import { Message, addMessages } from "../Redux/Store/messageSlice";
// import { useParams } from 'react-router-dom';
// import { signalRService } from "../Redux/Services/signalRService";
// import { get, keys, set } from "idb-keyval";

// const MessageList = ({ currentConversationId }: any) => {
//   const messages = useSelector((state: any) => state.message.messages);
//   const { conversationId } = useParams<{ conversationId: string | undefined }>();
//   const dispatch = useDispatch();
//   const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);

//   const [newMessages, setNewMessages] = useState<Message[]>([]);
//   const [latestMessage, setLatestMessage] = useState<Message | null>(null);

//   useEffect(() => {
//     // Retrieve the messages from IndexedDB and dispatch them to addMessages
//     keys().then(async (keys) => {
//       keys.sort();
//       for (const key of keys) {
//         const message = await get(key);
//         dispatch(addMessages([message]));
//       }
//     });

//     // Rest of your initialization code...
//   }, [dispatch]);

  

//   useEffect(() => {
//     console.log('Current conversationId:', conversationId);

//     if (conversationId !== undefined) {
//       signalRService.startConnection(conversationId).then(() => {
//         signalRService.subscribeToConversation(conversationId);

//         signalRService.registerReceiveLatestMessages(async (incomingMessages) => {
//           console.log('Received latest messages from messagelist:', incomingMessages);


//           let latestMessageObject;

//           if (typeof incomingMessages === 'string') {
//             // If incomingMessages is a string, create a new message object with default values
//             latestMessageObject = {
//               conversationId: conversationId,
//               message: incomingMessages,
//               messageContent: incomingMessages,
//               senderName: latestMessage?.senderName, // Use a default value for senderName
//               // Set other properties as needed
//             };
//           } else if (typeof incomingMessages === 'object') {
//             // If incomingMessages is an object, use it as the latest message object
//             latestMessageObject = incomingMessages;
//           }

//           if (latestMessageObject) {
//             if (Array.isArray(latestMessageObject)) {
//               setLatestMessage(latestMessageObject[0]);
//             } else {
//               setLatestMessage(latestMessageObject);
//             }
//           }


//         });
//       });
//     }
//   }, [conversationId, dispatch, signalRService, messages]);

//   useEffect(() => {
//     console.log('Current conversationId:', conversationId);

//     if (conversationId !== undefined) {
//       signalRService.registerReceiveLatestMessages((incomingMessages) => {
//         console.log('Received latest messages from messagelist:', incomingMessages);

//         // Check if incomingMessages is an array and update local state
//         setNewMessages(prevMessages => [...prevMessages, ...(Array.isArray(incomingMessages) ? incomingMessages : [incomingMessages])]);
//       });
//     }
//   }, [conversationId]);


//   return (
//     <div>
//       {/* Render the latest message separately */}
//       {latestMessage &&
//         <div>
//           <p><strong>Sender:</strong> {latestMessage.senderName}</p>
//           <p><strong>Message:</strong> {latestMessage.message}</p>
//         </div>
//       }

//       <ul>
//         {[...messages].sort((a: any, b: any) => new Date(b?.createdOn).getTime() - new Date(a?.createdOn).getTime())
//           .map((message: any, index: any) => (
//             message ? <li key={message.id}>
//               <p><strong>Sender:</strong> {message.senderName}</p>
//               <p><strong>Message:</strong> {message.message}</p>
//             </li> : null
//           ))}
//       </ul>
//     </div>
//   );
// }

// export default MessageList;
import React, { useState } from 'react';
import { SendMessageProps, useMessages } from '../Messages/useMessages';

import { useParams } from 'react-router-dom';
import { Message, addMessage } from '../Redux/Store/messageSlice';
import { useDispatch } from 'react-redux';

const MessageList: React.FC<SendMessageProps> = ({ setCurrentConversationId }) => {
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
      }

export default MessageList;
