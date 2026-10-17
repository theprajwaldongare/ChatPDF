import { useState } from 'react';
import UploadScreen from '@/components/UploadScreen';
import ChatScreen from '@/components/ChatScreen';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {ChatProvider} from '@/context/ChatContext';

// type Screen = 'upload' | 'chat';

function App() {
  return (
    <ChatProvider>
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950">
        <Routes>
          <Route path="/" element={<UploadScreen />} />
          
          <Route path="/chat/:conversationId" element={<ChatScreen />} />
        </Routes>
      </div>
    </BrowserRouter>
    </ChatProvider>
  );

}

export default App;
