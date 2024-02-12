import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Message, addMessage } from '../Redux/Store/messageSlice';
import { signalRService } from '../Redux/Services/signalRService';

export interface SendMessageProps {
  setCurrentConversationId: (conversationId: string) => void;
}

export const useMessages = (conversationId: string) => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (conversationId) {
      signalRService.startConnection(conversationId).then(() => {
        signalRService.subscribeToConversation(conversationId);
        signalRService.registerReceiveLatestMessages((incomingData: any) => {
            let latestMessageObjects: Message[] = [];
          
            // Check if incomingData is an array
            if (Array.isArray(incomingData)) {
   // Handle multiple messages
incomingData.forEach(data => {
    const message: Message = {
        id: data.id,
        conversationId: conversationId,
        senderName: data.senderName,
        messageContent: data.message,
        timestamp: data.createdOn && typeof data.createdOn === 'string' ? new Date(data.createdOn).toISOString() : undefined,
    };
  
    latestMessageObjects.push(message);
  });
            } else {
   // Handle a single message
   const message: Message = {
    id: incomingData.message,
    conversationId: conversationId,
    senderName: incomingData.senderName,
    messageContent: incomingData.message,
    timestamp: incomingData.timestamp && typeof incomingData.timestamp === 'string' ? new Date(incomingData.timestamp).toISOString() : undefined,
};

latestMessageObjects.push(message);
            }
          
            if (latestMessageObjects.length > 0) {
              console.log('incomingData', incomingData);
              console.log('latestMessageObjects', latestMessageObjects);
              setMessages(prevMessages => {
                // Filter out any messages that already exist in the array
                let newMessages = latestMessageObjects.filter(newMessage => !prevMessages.some(msg => msg.id === newMessage.id));
          
                // Add the new messages to the array
                let updatedMessages = [...prevMessages, ...newMessages];
          
                // // Sort the messages by timestamp in descending order
                updatedMessages.sort((a, b) => {
                    if (a.timestamp && b.timestamp) {
                        // If both timestamps exist, sort by the timestamps
                        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                    } else if (a.timestamp) {
                        // If only a's timestamp exists, a is newer
                        return -1;
                    } else if (b.timestamp) {
                        // If only b's timestamp exists, b is newer
                        return 1;
                    } else {
                        // If neither timestamp exists, don't change the order
                        return 0;
                    }
                });
          
                // Limit the total number of messages to 7
                return updatedMessages.slice(0, 3);
              });
            }
          });
      });
    }
  }, [conversationId]);

  useEffect(() => {
    console.log('messages', messages);
    
  }, [messages]);

  const sendMessage = async (messageContent: string) => {
    if (messageContent) {
      await signalRService.sendMessage(conversationId, messageContent);

      const myMessage: Message = {
        conversationId: conversationId,
        messageContent: messageContent,
        message: messageContent,
        senderName: messages[0]?.senderName,
      }

      dispatch(addMessage(myMessage));
    }
  };

  return { messages, sendMessage };
};