import { useState } from 'react';
import UploadScreen from '@/components/UploadScreen';
import ChatScreen from '@/components/ChatScreen';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// type Screen = 'upload' | 'chat';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950">
        <Routes>
          <Route path="/" element={<UploadScreen />} />
          
          <Route path="/chat/:conversationId" element={<ChatScreen />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
  // const [screen, setScreen] = useState<Screen>('upload');
  // const [fileName, setFileName] = useState<string>('');

  // const handleUpload = (name: string) => {
  //   setFileName(name);
  //   setScreen('chat');
  // };

  // const handleReset = () => {
  //   setFileName('');
  //   setScreen('upload');
  // };

  // return (
  //   <div className="min-h-screen bg-zinc-950">
  //     {screen === 'upload' ? (
  //       <UploadScreen onUpload={handleUpload} />
  //     ) : (
  //       <ChatScreen fileName={fileName} onReset={handleReset} />
  //     )}
  //   </div>
  // );
}

export default App;
