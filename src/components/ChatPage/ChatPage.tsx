// src/components/ChatPage/ChatPage.tsx

import { useContext, useState } from 'react';
import { Context } from '../../context/Context';
import Sidebar from '../Sidebar/Sidebar';
import Main from '../Main/Main';
import InputBox from '../InputBox/InputBox';
import Login from '../Auth/Login';
import SignUp from '../Auth/SignUp';

const ChatPage = () => {
  const context = useContext(Context);
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  
  if (!context) {
    throw new Error("ChatPage must be used within ContextProvider");
  }

  const { isAuthenticated } = context;

  return (
    <>
      {/* Показываем Sidebar только если залогинен */}
      {isAuthenticated && <Sidebar />}
      <Main onOpenAuthModal={setAuthModal} />
      <InputBox />
      
      {/* Модальные окна авторизации */}
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