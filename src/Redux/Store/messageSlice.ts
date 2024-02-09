import { PayloadAction, createSlice, configureStore } from "@reduxjs/toolkit";

export interface Message {
    jobAssigneeMessageId?: number;
    id?: string;
    conversationId: string;
    messageContent: string;
    message: string;
    parentMessageId?: string;
}

export interface MessageState {
    messages: Message[];
  //  message: string;
    conversationid: string | null ;
}

const initialState: MessageState = {
    messages: [],
 //   message: '',
    conversationid: null,
};

const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<Message>) => {
            const incomingMessage = action.payload;
            const exists = state.messages.some(message => message.jobAssigneeMessageId === incomingMessage.jobAssigneeMessageId);
            if (!exists) {
              state.messages = [...state.messages, incomingMessage];
            }
          },
          
        addMessages: (state, action: PayloadAction<Message[]>) => {
            // Assuming each message has a unique 'id'
            const incomingMessages = action.payload;
            const nonDuplicateMessages = incomingMessages.filter(incomingMessage => 
              !state.messages.some(existingMessage => existingMessage.id === incomingMessage.id)
            );
            state.messages = [...state.messages, ...nonDuplicateMessages];
          },
          
        removeDuplicateMessages: (state) => {
            const uniqueMessages = Array.from(new Set(state.messages.map(message => message.jobAssigneeMessageId)))
                .map(jobAssigneeMessageId => state.messages.find(message => message.jobAssigneeMessageId === jobAssigneeMessageId))
                .filter((message): message is Message => message !== undefined);
            state.messages = uniqueMessages;
        },
        setCurrentConversationId: (state, action: PayloadAction<string>) => {
            state.conversationid = action.payload;
        },
    },
});

export const { addMessage, addMessages, removeDuplicateMessages, setCurrentConversationId } = messageSlice.actions;
export default messageSlice.reducer;