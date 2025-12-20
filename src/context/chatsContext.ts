import { createContext, useContext } from "react";
import type { Chat } from "../services/chatService";

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

export const useChats = () => {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error("useChats must be used within ChatsProvider");
  }
  return context;
};
