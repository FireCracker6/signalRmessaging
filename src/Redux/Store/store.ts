import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
import messageReducer, { Message, MessageState } from './messageSlice';

const DeduplicateTransform = createTransform(
    // transform state on its way to being serialized and persisted.
    (inboundState: MessageState, key) => {
      // apply transformation only for the message slice
      if (key === 'message') {
        const uniqueMessages: Message[] = [];
        const messageIds = new Set();
        inboundState.messages.forEach((message: Message) => {
          if (!messageIds.has(message.jobAssigneeMessageId)) {
            uniqueMessages.push(message);
            messageIds.add(message.jobAssigneeMessageId);
          }
        });
        return { ...inboundState, messages: uniqueMessages };
      }
      return inboundState;
    },
    // transform state being rehydrated
    (outboundState: MessageState, key) => outboundState,
    // define which reducers this transform gets called for.
    { whitelist: ['message'] }
  );

const persistConfig = {
    key: 'message',
    storage,
    transforms: [DeduplicateTransform],
}

const persistedMessageReducer = persistReducer(persistConfig, messageReducer);

const rootReducer = {
  message: persistedMessageReducer
};

const store = configureStore({
  reducer: rootReducer,
});

export const persistor = persistStore(store);

export default store;