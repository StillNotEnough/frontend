// src/services/chatService.ts

import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/v1'; // URL твоего бекенда

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
  role: 'user' | 'assistant';
  content: string;
  templateUsed: string | null;
  createdAt: string;
}

class ChatService {
  private async getHeaders(): Promise<HeadersInit> {
    const token = authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Получить последние чаты
  async getRecentChats(limit: number = 20): Promise<Chat[]> {
    const response = await fetch(`${API_BASE_URL}/chats/recent?limit=${limit}`, {
      headers: await this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }

    return response.json();
  }

  // Создать новый чат
  async createChat(title: string, subject?: string): Promise<Chat> {
    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify({ title, subject })
    });

    if (!response.ok) {
      throw new Error('Failed to create chat');
    }

    return response.json();
  }

  // Получить сообщения чата
  async getChatMessages(chatId: number): Promise<ChatMessage[]> {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      headers: await this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  }

  // Добавить сообщение в чат
  async addMessage(
    chatId: number, 
    content: string, 
    role: 'user' | 'assistant',
    templateUsed?: string
  ): Promise<ChatMessage> {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify({ content, role, templateUsed })
    });

    if (!response.ok) {
      throw new Error('Failed to add message');
    }

    return response.json();
  }

  // Удалить чат
  async deleteChat(chatId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      method: 'DELETE',
      headers: await this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat');
    }
  }
}

export default new ChatService();