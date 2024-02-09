import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes, useLocation, useParams } from 'react-router-dom';
import SendMessage from './Components/SendMessage';
import MessageList from './Components/MessageList';
import { signalRService } from './Redux/Services/signalRService';
import { useSelector } from 'react-redux';
import { MessageState, setCurrentConversationId } from './Redux/Store/messageSlice';

function App() {
  const conversationid = useSelector((state: { message: MessageState }) => state.message.conversationid);
  console.log('conversationid from app', conversationid)
  useEffect(() => {
    signalRService.startConnection(conversationid ?? '');
  }, []);
  return (
    <>
    <Routes>
    <Route
          path="/sendMessage/:conversationId"
          element={<SendMessage setCurrentConversationId={setCurrentConversationId} />}
        />
        <Route
          path="/messageList/:conversationId"
          element={<MessageList currentConversationId={conversationid} />}
        />
      </Routes>
 
   
    </>
  );
}

export default App;
