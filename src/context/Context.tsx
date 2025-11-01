// src/context/Context.tsx - С /me ИНТЕГРАЦИЕЙ (AI логика НЕ ТРОНУТА!)

import { createContext, useState, useEffect } from "react";
import { sendChatMessageStream } from "../services/aiService";
import authService, { type CurrentUserResponse } from "../services/authService"; // ✨ Добавлен CurrentUserResponse
import chatService, {
  type Chat,
  type ChatMessage as ApiChatMessage,
} from "../services/chatService";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ContextType {
  input: string;
  setInput: (input: string) => void;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  subject: string;
  setSubject: (subject: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  sidebarExtended: boolean;
  setSidebarExtended: (extended: boolean) => void;
  sendMessage: (prompt: string) => Promise<void>;
  isAuthenticated: boolean;
  username: string | null;
  user: CurrentUserResponse | null; // ✨ НОВОЕ: полные данные пользователя
  userLoading: boolean; // ✨ НОВОЕ
  refreshUser: () => Promise<void>; // ✨ НОВОЕ
  logout: () => void;
  chats: Chat[];
  currentChatId: number | null;
  loadChats: () => Promise<void>;
  createNewChat: () => Promise<void>;
  selectChat: (chatId: number) => Promise<void>;
  deleteChat: (chatId: number) => Promise<void>;
  renameChat: (chatId: number, newTitle: string) => Promise<void>;
  deleteAllChats: () => Promise<void>;
}

export const Context = createContext<ContextType | undefined>(undefined);

interface ContextProviderProps {
  children: React.ReactNode;
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("general");

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as "light" | "dark") || "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const [sidebarExtended, setSidebarExtended] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated()
  );
  const [username, setUsername] = useState(authService.getUsername());

  // ✨ НОВОЕ: состояние для данных пользователя из /me
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  // ✨ НОВАЯ ФУНКЦИЯ: загрузка данных пользователя из /me
  const refreshUser = async () => {
    if (!isAuthenticated) {
      setUser(null);
      setUsername(null);
      return;
    }

    try {
      setUserLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setUsername(userData.username);
      console.log('✅ User data loaded from /me:', userData);
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      setUsername(authService.getUsername());
    } finally {
      setUserLoading(false);
    }
  };

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const refreshToken = authService.getRefreshToken();

      if (!refreshToken) {
        setIsAuthenticated(false);
        setUsername(null);
        setUser(null); // ✨
        return;
      }

      if (authService.isRefreshTokenExpired()) {
        console.log("🔴 Refresh token expired on load");
        logout();
        return;
      }

      if (
        authService.isAccessTokenExpired() ||
        authService.willAccessTokenExpireSoon()
      ) {
        console.log(
          "🔄 Access token expired/expiring on page load, refreshing..."
        );

        try {
          await authService.refreshTokens();
          console.log("✅ Tokens refreshed on page load");

          setIsAuthenticated(true);
          setUsername(authService.getUsername());
          await refreshUser(); // ✨
        } catch (error) {
          console.error("❌ Failed to refresh on load:", error);
          logout();
        }
      } else {
        setIsAuthenticated(true);
        setUsername(authService.getUsername());
        await refreshUser(); // ✨
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    } else {
      setChats([]);
      setCurrentChatId(null);
      setMessages([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      if (authService.willAccessTokenExpireSoon()) {
        console.log("🔄 Access token expiring soon, refreshing...");

        try {
          await authService.refreshTokens();
          console.log("✅ Tokens refreshed in background");
        } catch (error) {
          console.error("❌ Failed to refresh tokens:", error);
          logout();
        }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (authService.isRefreshTokenExpired()) {
        console.log("🔴 Refresh token expired, logging out...");
        alert("Your session has expired. Please log in again.");
        logout();
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const logout = async () => {
    await authService.logoutOnBackend();
    authService.logout();
    setIsAuthenticated(false);
    setUsername(null);
    setUser(null); // ✨
    setMessages([]);
    setChats([]);
    setCurrentChatId(null);
  };

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

      const convertedMessages: Message[] = chatMessages.map(
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

  // ✨ ОРИГИНАЛЬНАЯ AI ЛОГИКА - НЕ ТРОНУТА!
  const sendMessage = async (prompt: string) => {
    try {
      setLoading(true);

      let chatId = currentChatId;

      if (!chatId && isAuthenticated) {
        console.log("📝 Первое сообщение - создаем чат в БД");

        const newChat = await chatService.createChat("New Chat", subject);
        chatId = newChat.id;
        setCurrentChatId(chatId);
        setChats((prev) => [newChat, ...prev]);

        console.log(`✅ Чат создан с ID: ${chatId}`);
      }

      const userMessage: Message = { role: "user", content: prompt };
      setMessages((prev: Message[]) => [...prev, userMessage]);
      setInput("");

      if (isAuthenticated && chatId) {
        await chatService.addMessage(chatId, prompt, "user", subject);
        await loadChats();
      }

      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages((prev: Message[]) => [...prev, assistantMessage]);

      let assistantContent = "";

      await sendChatMessageStream(
        {
          message: prompt,
          subject: subject,
          conversationHistory: messages,
          stream: true,
        },
        (chunk: string) => {
          assistantContent += chunk;
          setMessages((prev: Message[]) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;

            if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: assistantContent,
              };
            }

            return newMessages;
          });
        },
        async () => {
          if (isAuthenticated && chatId) {
            try {
              await chatService.addMessage(
                chatId,
                assistantContent,
                "assistant",
                subject
              );
              await loadChats();
            } catch (error) {
              console.error("Failed to save assistant message:", error);
            }
          }
          setLoading(false);
        },
        (error: Error) => {
          console.error("Streaming error:", error);
          setMessages((prev: Message[]) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === "assistant" && !lastMessage.content) {
              lastMessage.content =
                "Sorry, there was an error processing your request.";
            }
            return newMessages;
          });
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
    }
  };

  return (
    <Context.Provider
      value={{
        input,
        setInput,
        messages,
        setMessages,
        loading,
        setLoading,
        subject,
        setSubject,
        theme,
        toggleTheme,
        sidebarExtended,
        setSidebarExtended,
        sendMessage,
        isAuthenticated,
        username,
        user, // ✨ НОВОЕ
        userLoading, // ✨ НОВОЕ
        refreshUser, // ✨ НОВОЕ
        logout,
        chats,
        currentChatId,
        loadChats,
        createNewChat,
        selectChat,
        deleteChat,
        renameChat,
        deleteAllChats,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;