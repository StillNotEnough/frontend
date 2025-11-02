// src/context/Context.tsx
import { AuthProvider, useAuth } from "./AuthContext";
import { UIProvider } from "./UIContext";
import { MessagesProvider, useMessages } from "./MessagesContext";
import { ChatsProvider } from "./ChatsContext";

// Экспортируем хуки
export { useAuth } from "./AuthContext";
export { useUI } from "./UIContext";
export { useMessages } from "./MessagesContext";
export { useChats } from "./ChatsContext";

// Главный провайдер
export const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <UIProvider>
        <MessagesAndChatsWrapper>
          {children}
        </MessagesAndChatsWrapper>
      </UIProvider>
    </AuthProvider>
  );
};

// Вспомогательный компонент для связи контекстов
const MessagesAndChatsWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth(); // Берём из AuthContext
  
  return (
    <MessagesProvider>
      <ChatsWrapper isAuthenticated={isAuthenticated}>
        {children}
      </ChatsWrapper>
    </MessagesProvider>
  );
};

// Ещё один wrapper для передачи setMessages в ChatsProvider
const ChatsWrapper = ({ 
  children, 
  isAuthenticated 
}: { 
  children: React.ReactNode;
  isAuthenticated: boolean;
}) => {
  const { setMessages, setLoading } = useMessages(); // Берём из MessagesContext
  
  return (
    <ChatsProvider 
      isAuthenticated={isAuthenticated}
      setMessages={setMessages}
      setLoading={setLoading}
    >
      {children}
    </ChatsProvider>
  );
};

export default ContextProvider;