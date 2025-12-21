// src/components/ChatPage/ChatPage.tsx - С РАЗДЕЛЕННЫМИ КОНТЕКСТАМИ

import { useAuth } from "../../context/Context";
import Sidebar from "../Sidebar/Sidebar";
import Main from "../Main/Main";
import InputBox from "../InputBox/InputBox";
import Login from "../Auth/Login";
import SignUp from "../Auth/SignUp";

const ChatPage = () => {
  // Используем useAuth вместо Context
  const { isAuthenticated, authModal, openAuthModal, closeAuthModal } =
    useAuth();

  return (
    <>
      {/* Показываем Sidebar только если залогинен */}
      {isAuthenticated && <Sidebar />}
      <Main onOpenAuthModal={openAuthModal} />
      <InputBox />

      {/* Модальные окны авторизации */}
      {authModal === "login" && <Login onClose={closeAuthModal} />}
      {authModal === "signup" && <SignUp onClose={closeAuthModal} />}
    </>
  );
};

export default ChatPage;