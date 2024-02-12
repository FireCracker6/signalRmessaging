import * as signalR from '@microsoft/signalr';
import  store, {  persistor } from '../Store/store';

import { Message, addMessage, setCurrentConversationId } from "../Store/messageSlice";
import axios from 'axios';

class SignalRService {
    public hubConnection: signalR.HubConnection | null = null;
    private connectionRef: signalR.HubConnection | null = null;
    private currentConversationId: string | null = null;
    private onMessageReceived: ((message: Message) => void) | null = null;

    heartbeatIntervalId: NodeJS.Timer | null = null;

    startHeartbeat() {
        if (!this.hubConnection) return;
    
        this.stopHeartbeat(); // Ensure any existing heartbeat is stopped.
    
        // Immediately send the first heartbeat.
        this.sendHeartbeat();
    console.log('heartbeat sent')
        // Then continue sending heartbeats at specified intervals.
        this.heartbeatIntervalId = setInterval(() => {
            this.sendHeartbeat();
        }, 30000); // Adjust interval as needed.
    }
    
    sendHeartbeat() {
        this.hubConnection?.invoke("Heartbeat").catch(err => console.error("Heartbeat failed: ", err));
    }
    
    
    stopHeartbeat() {
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
            this.heartbeatIntervalId = null;
        }
    }
  
    public startConnection = (conversationId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            this.hubConnection = new signalR.HubConnectionBuilder()
                .withUrl("http://192.168.1.80:5129/notificationhub", {
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .withAutomaticReconnect([0, 2, 3, 4]) // Attempt to reconnect immediately, then wait 2s, 10s, and 30s for subsequent attempts.

                .configureLogging(signalR.LogLevel.Debug)
                .build();
               
            this.hubConnection.on('receivelatestmessages', (messages) => {
                console.log('Received latest messages:', messages);
              this.startHeartbeat();
            });
    
            this.hubConnection.start().then(() => {
                console.log("SignalR connection started");
                this.startHeartbeat(); // Start heartbeat after connection is established
                this.registerOnMessageReceived(conversationId);
                resolve();
            }).catch(err => {
                console.error("Error while starting SignalR connection: " + err);
                reject(err);
            });
            
        });
    };



      public subscribeToConversation = async (conversationId: string) => {
        try {
            await this.hubConnection?.invoke("SubscribeToConversation", conversationId);
            console.log("Subscribed to conversation:", conversationId);
        } catch (err) {
            console.error("Error while subscribing to conversation:", err);
        }
    };

    public disconnect = () => {
        this.hubConnection?.stop()
            .then(() => {
                console.log("SignalR connection stopped");
                this.stopHeartbeat();
            })
            .catch(err => {
                console.error("Error while stopping SignalR connection: " + err);
            });
    };
    
    private registerOnMessageReceived = (conversationId: string) => {
        if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
            this.hubConnection.on("ReceiveMessage", (incomingMessage: any) => {
                console.log("Received message:", incomingMessage);
    
                // Create a Message object from the incoming data
                let timestamp = incomingMessage.timestamp;
                if (timestamp && !isNaN(Date.parse(timestamp))) {
                    timestamp = new Date(timestamp).toISOString();
                } else {
                    timestamp = null;
                }
                const message: Message = {
                    id: incomingMessage.id,
                    conversationId: incomingMessage.conversationId,
                    senderName: incomingMessage.senderName,
                    messageContent: incomingMessage.messageContent,
                    timestamp: timestamp,
                };
    
                // Dispatch action to update Redux store with the received message
                store.dispatch(addMessage(message));
                store.dispatch(setCurrentConversationId(conversationId))
                console.log('on message received conversationid', conversationId)
            });
    
            // Subscribe to messages for the specific conversation ID
            this.hubConnection.invoke("SubscribeToConversation", conversationId)
                .then(() => {
                    console.log("Subscribed to conversation:", conversationId);
                })
                .catch(err => {
                    console.error("Error while subscribing to conversation:", err);
                });
        } else {
            console.error("SignalR connection is not in the 'Connected' state");
        }
    };
    
    public registerReceiveLatestMessages(callback: (messages: Message[]) => void) {
        this.hubConnection?.on("ReceiveLatestMessages", callback);
    }
    

    public fetchMessagesForConversation = async (conversationId: string) => {
        try {
            const response = await axios.get(`http://192.168.1.80:5129/api/Message/api/messages/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.data) {
                // Assuming response.data contains an array of messages
                response.data.$values.forEach((message: any) => {
                    store.dispatch(addMessage(message));
                    console.log(response.data.$values)
                });
                console.log('Messages fetched successfully for conversation:', conversationId);
            }
        } catch (error) {
            console.error(`Failed to fetch messages for conversation ${conversationId}:`, error);
        }
    };
    
    public sendMessage = async (conversationId: string, messageContent: string) => {
        if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
            try {
                console.log("Sending message with payload:", { conversationId, messageContent });
                await this.hubConnection.invoke("SendMessage", conversationId, messageContent);
                console.log("Message sent successfully");
 
    
                // Update the current conversation ID in the Redux store
               
                store.dispatch(setCurrentConversationId(conversationId))
                persistor.flush().then(() => {
                    console.log('Persisted state has been flushed to storage.');
                });
            } catch (err) {
                console.error("Send message error: ", err);
            }
        } else {
            console.error("SignalR connection not established");
        }
    };
    
   

    
}

export const signalRService = new SignalRService();