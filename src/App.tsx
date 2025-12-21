// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ContextProvider from './context/ContextProvider';
import ChatPage from './components/ChatPage/ChatPage';

const App = () => {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          {/* Только главная страница */}
          <Route path="/" element={<ChatPage />} />
          
          {/* Redirect для всех остальных путей */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ContextProvider>
  );
};

export default App;