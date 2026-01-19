// src/services/chatService.ts

import { apiClient } from "./apiClient";
import { API_BASE_URL } from "./apiConfig";

const CHAT_API_URL = `${API_BASE_URL}/api/v1`;

export interface Chat {
  id: number;
  userId: number;
  title: string;
  subject: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  chatId: number;
  role: "user" | "assistant";
  content: string;
  templateUsed: string | null;
  createdAt: string;
}

class ChatService {
  // Получить последние чаты
  async getRecentChats(limit: number = 20): Promise<Chat[]> {
    const response = await apiClient.get(
      `${CHAT_API_URL}/chats/recent?limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch chats");
    }

    const data = await response.json();

    return data.chats || [];
  }

  // Создать новый чат
  async createChat(title: string, subject?: string): Promise<Chat> {
    const response = await apiClient.post(`${CHAT_API_URL}/chats`, {
      title,
      subject,
    });

    if (!response.ok) {
      throw new Error("Failed to create chat");
    }

    return response.json();
  }

  // Получить сообщения чата
  async getChatMessages(chatId: number): Promise<ChatMessage[]> {
    const response = await apiClient.get(
      `${CHAT_API_URL}/chats/${chatId}/messages`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }

    const data = await response.json();

    console.log("📦 RAW response from backend:", data); // ← ДОБАВЬ ЭТО
    console.log("📦 data.messages:", data.messages); // ← И ЭТО
    console.log("📦 Is array?", Array.isArray(data.messages)); // ← И ЭТО

    return data.messages || [];
  }

  // Добавить сообщение в чат
  async addMessage(
    chatId: number,
    content: string,
    role: "user" | "assistant",
    templateUsed?: string,
  ): Promise<ChatMessage> {
    const response = await apiClient.post(
      `${CHAT_API_URL}/chats/${chatId}/messages`,
      {
        content,
        role,
        templateUsed,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to add message");
    }

    return response.json();
  }

  // Удалить чат
  async deleteChat(chatId: number): Promise<void> {
    const response = await apiClient.delete(`${CHAT_API_URL}/chats/${chatId}`);

    if (!response.ok) {
      throw new Error("Failed to delete chat");
    }
  }

  async renameChat(chatId: number, newTitle: string): Promise<Chat> {
    const response = await apiClient.put(
      `${CHAT_API_URL}/chats/${chatId}/title`,
      { newTitle },
    );
    if (!response.ok) throw new Error("Failed to rename chat");
    return response.json();
  }

  async deleteAllChats(): Promise<void> {
    const response = await apiClient.delete(`${CHAT_API_URL}/chats/all`);

    if (!response.ok) throw new Error("Failed to delete all chats");
  }
}

export default new ChatService();
