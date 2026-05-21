import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Memories from './components/Memories';
import SessionDetail from './components/SessionDetail';
import AudioUpload from './components/AudioUpload';
import Chat from './components/Chat';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/sessions/:id" element={<SessionDetail />} />
        <Route path="/upload" element={<AudioUpload />} />
        <Route path="/ask" element={<Chat />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

