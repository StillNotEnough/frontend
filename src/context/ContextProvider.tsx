import { AuthProvider } from "./AuthProvider";
import { UIProvider } from "./UIProvider";
import { MessagesProvider } from "./MessagesProvider";
import { ChatsProvider } from "./ChatsProvider";
import { useAuth } from "./authContext";
import { useMessages } from "./messagesContext";

const MessagesAndChatsWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <MessagesProvider>
      <ChatsWrapper isAuthenticated={isAuthenticated}>{children}</ChatsWrapper>
    </MessagesProvider>
  );
};

const ChatsWrapper = ({
  children,
  isAuthenticated,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
}) => {
  const { setMessages, setLoading } = useMessages();

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

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <UIProvider>
        <MessagesAndChatsWrapper>{children}</MessagesAndChatsWrapper>
      </UIProvider>
    </AuthProvider>
  );
};

export default ContextProvider;