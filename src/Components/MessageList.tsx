// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import * as signalR from '@microsoft/signalr';
// import { Message, addMessage, addMessages } from "../Redux/Store/messageSlice";
// import Modal from 'react-modal';
// import { persistor } from "../Redux/Store/store";
// import { removeDuplicateMessages } from "../Redux/Store/messageSlice";
// interface MessageListProps {
//   currentConversationId?: string;
// }

// const MessageList: React.FC<MessageListProps> = ({ currentConversationId }) => {
//   const messages = useSelector((state: any) => state.message.messages);
//   const dispatch = useDispatch();
//   const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);

//   const handleRemoveDuplicates = () => {
//     dispatch(removeDuplicateMessages());
//   };

//   useEffect(() => {
//     const startSignalRConnection = async () => {
//       const hubConnect = new signalR.HubConnectionBuilder()
//         .withUrl("http://192.168.1.80:5129/notificationhub", {
//           skipNegotiation: true,
//           transport: signalR.HttpTransportType.WebSockets
//         })
//         .withAutomaticReconnect()
//         .configureLogging(signalR.LogLevel.Debug)
//         .build();
  
//       let intervalId: NodeJS.Timeout;
  
//       hubConnect.onreconnected(async (connectionId) => {
//         console.log(`Connection re-established. Connected with connectionId "${connectionId}".`);
//         await hubConnect.invoke("SubscribeToConversation", currentConversationId ?? '');
//       });
//       hubConnect.on('receivelatestmessages', (incomingMessages: Message[]) => {
//         console.log('Received latest messages:', incomingMessages);
//         const latestMessage = incomingMessages[incomingMessages.length - 1];
//         if (latestMessage) {
//           dispatch(addMessage(latestMessage));
//         }
//       });
//       hubConnect.on('userconnected', (connectionId: string) => {
//         console.log('User connected:', connectionId);
//       });
  
//       try {
//         await hubConnect.start();
//         console.log('SignalR connection established');
//         await hubConnect.invoke("SubscribeToConversation", currentConversationId ?? '');
//         intervalId = setInterval(async () => {
//           await hubConnect.invoke("SubscribeToConversation", currentConversationId ?? '');
//         }, 5000);
//       } catch (error) {
//         console.error('Error while establishing SignalR connection:', error);
//       }
  
//       setHubConnection(hubConnect);
  
//       return () => {
//         hubConnection?.stop().catch(err => console.error("Error while stopping SignalR connection: " + err));
//         clearInterval(intervalId);
//       };
//     };
  
//     startSignalRConnection();
//   }, [currentConversationId, dispatch, messages.length]);

//   useEffect(() => {
//     console.log("Messages from Redux store:", messages);
//   }, [messages]);

//   return (
//     <div>
//         <button onClick={handleRemoveDuplicates}>Remove Duplicates</button>
//       <ul>
//       {[...messages].sort((a: any, b: any) => new Date(b?.createdOn).getTime() - new Date(a?.createdOn).getTime())
//   .map((message: any, index: any) => (
//     message ? <li key={message.id}>{message.message}</li> : null
// ))}
//     </ul>
//     </div>
//   );
// };

// export default MessageList;

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as signalR from '@microsoft/signalr';
import { addMessages } from "../Redux/Store/messageSlice";
import { useParams } from 'react-router-dom';
const MessageList = ({ currentConversationId }: any) => {
  const messages = useSelector((state: any) => state.message.messages);
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    console.log('current conversationid', conversationId)
    const startSignalRConnection = async () => {
      const hubConnect = new signalR.HubConnectionBuilder()
        .withUrl("http://192.168.1.80:5129/notificationhub", {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Debug)
        .build();
        hubConnect.onreconnected(async (connectionId) => {
                  console.log(`Connection re-established. Connected with connectionId "${connectionId}".`);
                  await hubConnect.invoke("SubscribeToConversation", conversationId ?? '');
                });
                hubConnect.on("receivelatestmessages", (incomingMessages) => {
                  try {
                    console.log('Received latest messages from messagelist:', incomingMessages);
                    console.log('Message id from messagelist:', incomingMessages.jobAssigneeMessageId);
                    console.log('Created on dates:', incomingMessages.map((message: any) => message.createdOn)); // Add this line
                    dispatch(addMessages(incomingMessages)); // No need to parse with JSON.parse
                  } catch (error) {
                    console.error('Error parsing incoming messages:', error);
                  }
                });
      hubConnect.onclose((error) => {
        console.error("SignalR connection closed", error);
      });

      try {
        await hubConnect.start();
        console.log('SignalR connection established');
        await hubConnect.invoke("SubscribeToConversation", conversationId ?? '');
      } catch (error) {
        console.error('Error while establishing SignalR connection:', error);
      }

      setHubConnection(hubConnect);

      return () => {
        hubConnect.stop().catch(err => console.error("Error while stopping SignalR connection: " + err));
      };
    };

    if (conversationId) {
      startSignalRConnection();
    }

    // Clean up on component unmount or conversationId change
    return () => {
      hubConnection?.stop().catch(err => console.error("Error while stopping SignalR connection: " + err));
    };
  }, [conversationId, dispatch]);

  return (
    <div>
      <ul>
      {[...messages].sort((a: any, b: any) => new Date(b?.createdOn).getTime() - new Date(a?.createdOn).getTime())
  .map((message: any, index: any) => (
    message ? <li key={message.id}>
      <p><strong>Sender:</strong> {message.senderName}</p>
      <p><strong>Message:</strong> {message.message}</p>
    </li> : null
  ))}
      </ul>
    </div>
  );
}

export default MessageList;
