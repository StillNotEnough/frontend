import { createContext, useContext } from "react";
import type { Chat } from "../services/chatService";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface MessagesContextType {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  sendMessage: (
    prompt: string,
    subject: string,
    isAuthenticated: boolean,
    currentChatId: number | null,
    setCurrentChatId: (id: number | null) => void,
    setChats: (fn: (prev: Chat[]) => Chat[]) => void,
    loadChats: () => Promise<void>
  ) => Promise<void>;
}

export const MessagesContext = createContext<
  MessagesContextType | undefined
>(undefined);

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within MessagesProvider");
  }
  return context;
};