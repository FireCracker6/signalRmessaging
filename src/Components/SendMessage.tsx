// import { useEffect, useState } from "react"
// import { signalRService } from "../Redux/Services/signalRService";
// import { Message, MessageState, addMessage, setCurrentConversationId } from "../Redux/Store/messageSlice";
// import { useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { persistor, store } from "../Redux/Store/store";


// interface RouteParams {
//     [key: string]: string;
//   }

//   interface SendMessageProps {
//     setCurrentConversationId: (conversationId: string) => void;
//   }
//   const SendMessage: React.FC<SendMessageProps> = ({ setCurrentConversationId }) => {
//     const { conversationId } = useParams();
//     const [messageContent, setMessageContent] = useState('');
  
//     const dispatch = useDispatch();
//   const navigate = useNavigate();
//     const messages = useSelector((state: { message: MessageState }) => state.message.messages);
//     const currentConversationId = useSelector((state: { message: MessageState }) => state.message.conversationid);
//     console.log(currentConversationId)

//     useEffect(() => {
//       setCurrentConversationId(conversationId ?? '');
//     }, [conversationId, setCurrentConversationId]);

    
  
//     const sendMessage = async () => {
//       if (messageContent) {
//         await signalRService.sendMessage(conversationId ?? '', messageContent);
    
//         const myMessage: Message = {
//           conversationId: conversationId ?? '',
//           messageContent: messageContent,
//           message: messageContent
//         }
    
//         dispatch(addMessage(myMessage));
    
//         const unsubscribe = store.subscribe(() => {
//           const messages = store.getState().message.messages;
//           const newMessageAdded = messages.some(m => m.messageContent === messageContent && m.conversationId === conversationId);
    
//           // if (newMessageAdded) {
//           //   persistor.flush().then(() => {
//           //     console.log('Persisted state has been flushed to storage.');
//           //     unsubscribe(); // Unsubscribe to prevent multiple subscriptions
//           //   });
//           // }
//         });
    
//       //  navigate('/messageList');
//         console.log(addMessage(myMessage))
//         setMessageContent('');
//       }
//     };
//   useEffect(() => {
//   const newMessageAdded = messages.some(m => m.messageContent === messageContent && m.conversationId === conversationId);

//   if (newMessageAdded) {
//     persistor.flush().then(() => {
//       console.log('Persisted state has been flushed to storage.');
//     });
//   }
// }, [messages, messageContent, conversationId]);
//     return (
//       <>
//         <div>
//           <input 
//             type="text"
//             value={messageContent}
//             onChange={(e) => setMessageContent(e.target.value)}
//           />
//           <button onClick={sendMessage}>Send</button>

//           <ul>
//         {messages.map((message, index) => (
//             <li key={index}>{message.messageContent}</li>
//         ))}
//     </ul>
//         </div>
//       </>
//     )
//   }
  
//   export default SendMessage;

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { MessageState, Message, addMessage } from '../Redux/Store/messageSlice';
import { signalRService } from '../Redux/Services/signalRService';

interface SendMessageProps {
  setCurrentConversationId: (conversationId: string) => void;
}

const SendMessage: React.FC<SendMessageProps> = ({ setCurrentConversationId }) => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messageContent, setMessageContent] = useState('');
  const dispatch = useDispatch();
  const messages = useSelector((state: { message: MessageState }) => state.message.messages);

  useEffect(() => {
    setCurrentConversationId(conversationId ?? '');
  }, [conversationId, setCurrentConversationId]);

  const sendMessage = async () => {
    if (messageContent) {
      await signalRService.sendMessage(conversationId ?? '', messageContent);

      const myMessage: Message = {
   
        conversationId: conversationId ?? '',
        messageContent: messageContent,
        message: messageContent
      }

      dispatch(addMessage(myMessage));
      setMessageContent('');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={messageContent}
        onChange={e => setMessageContent(e.target.value)}
      />
      <button onClick={sendMessage}>Send Message</button>
     
    </div>
  );
};

export default SendMessage;