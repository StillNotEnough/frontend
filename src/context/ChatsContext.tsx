// src/context/ChatsContext.tsx
import { createContext, useState, useEffect, useContext } from "react";
import chatService, {
  type Chat,
  type ChatMessage as ApiChatMessage,
} from "../services/chatService";

export interface ChatsContextType {
  chats: Chat[];
  currentChatId: number | null;
  setCurrentChatId: (id: number | null) => void;
  loadChats: () => Promise<void>;
  createNewChat: () => Promise<void>;
  selectChat: (chatId: number) => Promise<void>;
  deleteChat: (chatId: number) => Promise<void>;
  renameChat: (chatId: number, newTitle: string) => Promise<void>;
  deleteAllChats: () => Promise<void>;
}

export const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export const ChatsProvider = ({ 
  children,
  isAuthenticated,
  setMessages,
  setLoading
}: { 
  children: React.ReactNode;
  isAuthenticated: boolean;
  setMessages: (messages: any[] | ((prev: any[]) => any[])) => void;
  setLoading: (loading: boolean) => void;
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    } else {
      setChats([]);
      setCurrentChatId(null);
      setMessages([]);
    }
  }, [isAuthenticated]);

  const loadChats = async () => {
    try {
      const fetchedChats = await chatService.getRecentChats(100);
      setChats(fetchedChats);
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  const createNewChat = async () => {
    try {
      setCurrentChatId(null);
      setMessages([]);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const selectChat = async (chatId: number) => {
    try {
      setLoading(true);
      const chatMessages = await chatService.getChatMessages(chatId);

      const convertedMessages: any[] = chatMessages.map(
        (msg: ApiChatMessage) => ({
          role: msg.role,
          content: msg.content,
        })
      );

      setMessages(convertedMessages);
      setCurrentChatId(chatId);
    } catch (error) {
      console.error("Failed to load chat messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId: number) => {
    try {
      await chatService.deleteChat(chatId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));

      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const renameChat = async (chatId: number, newTitle: string) => {
    try {
      const updatedChat = await chatService.renameChat(chatId, newTitle);

      setChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? updatedChat : chat))
      );
    } catch (error) {
      console.error("Failed to rename chat:", error);
      throw error;
    }
  };

  const deleteAllChats = async () => {
    try {
      await chatService.deleteAllChats();

      setChats([]);
      setCurrentChatId(null);
      setMessages([]);
    } catch (error) {
      console.error("Failed to delete all chats:", error);
      throw error;
    }
  };

  return (
    <ChatsContext.Provider
      value={{
        chats,
        currentChatId,
        setCurrentChatId,
        loadChats,
        createNewChat,
        selectChat,
        deleteChat,
        renameChat,
        deleteAllChats,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
};

export const useChats = () => {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error("useChats must be used within ChatsProvider");
  }
  return context;
};