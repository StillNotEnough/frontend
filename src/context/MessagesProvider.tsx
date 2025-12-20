import { useState } from "react";
import { sendChatMessageStream } from "../services/aiService";
import chatService, { type Chat } from "../services/chatService";
import { MessagesContext, type Message } from "./messagesContext";

export const MessagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // ✨ ОРИГИНАЛЬНАЯ AI ЛОГИКА - НЕ ТРОНУТА!
  const sendMessage = async (
    prompt: string,
    subject: string,
    isAuthenticated: boolean,
    currentChatId: number | null,
    setCurrentChatId: (id: number | null) => void,
    setChats: (fn: (prev: Chat[]) => Chat[]) => void,
    loadChats: () => Promise<void>
  ) => {
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

      if (isAuthenticated && chatId) {
        await chatService.addMessage(chatId, prompt, "user", subject);
        await loadChats();
      }

      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages((prev: Message[]) => [...prev, assistantMessage]);

      let assistantContent = "";

      const recentMessages = messages.slice(-20); // последние 20 сообщений помнит ии

      await sendChatMessageStream(
        {
          message: prompt,
          subject: subject,
          conversationHistory: recentMessages,
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
    <MessagesContext.Provider
      value={{
        messages,
        setMessages,
        loading,
        setLoading,
        sendMessage,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};
