const API_BASE_URL = "http://localhost:8000"; // Измени на свой URL

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  message: string;
  subject?: string;
  conversationHistory?: ChatMessage[];
  stream?: boolean;
}

export interface ChatResponse {
  message: string;
  conversationId?: string;
  timestamp: string;
}

/**
 * Отправка обычного запроса (без стриминга)
 */
export const sendChatMessage = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...request,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Отправка запроса со стримингом
 */
export const sendChatMessageStream = async (
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    console.log("🚀 Starting stream request:", request);
    
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is null");
    }

    let buffer = ""; // Буфер для накопления неполных строк
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log("✅ Stream complete. Total chunks:", chunkCount);
        onComplete();
        break;
      }

      // Декодируем чанк и добавляем к буферу
      const decoded = decoder.decode(value, { stream: true });
      buffer += decoded;
      
      console.log(`📦 Raw chunk #${++chunkCount}:`, decoded.substring(0, 100));
      
      // Разбиваем по переносам строк
      const lines = buffer.split("\n");
      
      // Последняя строка может быть неполной, сохраняем её в буфере
      buffer = lines.pop() || "";

      // Обрабатываем полные строки
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) continue;
        
        if (trimmedLine.startsWith("data: ")) {
          const data = trimmedLine.slice(6).trim();

          if (data === "[DONE]") {
            console.log("🏁 Received [DONE] signal");
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            console.log("📝 Parsed data:", parsed);
            
            if (parsed.content) {
              console.log("✨ Content chunk:", parsed.content);
              onChunk(parsed.content);
            }
          } catch (e) {
            console.error("❌ Failed to parse chunk:", data, e);
          }
        } else {
          console.warn("⚠️ Line doesn't start with 'data:':", trimmedLine.substring(0, 50));
        }
      }
    }
  } catch (error) {
    console.error("💥 Stream error:", error);
    onError(error as Error);
  }
};