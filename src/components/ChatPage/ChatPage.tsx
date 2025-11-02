// src/components/ChatPage/ChatPage.tsx - С РАЗДЕЛЕННЫМИ КОНТЕКСТАМИ

import { useState } from 'react';
import { useAuth } from '../../context/Context'; // ✅ ИЗМЕНИЛИ ИМПОРТ
import Sidebar from '../Sidebar/Sidebar';
import Main from '../Main/Main';
import InputBox from '../InputBox/InputBox';
import Login from '../Auth/Login';
import SignUp from '../Auth/SignUp';

const ChatPage = () => {
  // ✅ Используем useAuth вместо Context
  const { isAuthenticated } = useAuth();
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);

  return (
    <>
      {/* Показываем Sidebar только если залогинен */}
      {isAuthenticated && <Sidebar />}
      <Main onOpenAuthModal={setAuthModal} />
      <InputBox />
      
      {/* Модальные окны авторизации */}
      {authModal === 'login' && (
        <Login onClose={() => setAuthModal(null)} />
      )}
      {authModal === 'signup' && (
        <SignUp onClose={() => setAuthModal(null)} />
      )}
    </>
  );
};

export default ChatPage;