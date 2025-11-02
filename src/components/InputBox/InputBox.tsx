// InputBox.tsx - С useCallback ОПТИМИЗАЦИЕЙ

import { useEffect, useRef, useState, useCallback } from "react";
import { useMessages, useUI, useAuth, useChats } from "../../context/Context";
import { assets } from "../../assets/assets";
import "./InputBox.css";

const InputBox = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ✅ ЛОКАЛЬНЫЙ STATE - главная оптимизация!
  const [localInput, setLocalInput] = useState("");
  
  const prevMessagesLengthRef = useRef(0);

  // ✅ Используем разделенные контексты
  const { messages, loading, sendMessage } = useMessages();
  const { subject, sidebarExtended } = useUI(); // ✅ Объединил в один вызов
  const { isAuthenticated } = useAuth();
  const { currentChatId, setCurrentChatId, loadChats } = useChats();

  // ✨ Отключаем transition на overlay и container
  useEffect(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!overlay || !container) return;

    const prevLength = prevMessagesLengthRef.current;
    const currentLength = messages.length;

    console.log(`📊 Messages: ${prevLength} → ${currentLength}`);

    // Анимация ТОЛЬКО при переходе 0 → 1 (первое сообщение)
    if (prevLength === 0 && currentLength === 1) {
      console.log('✨ ПЕРВОЕ СООБЩЕНИЕ - АНИМАЦИЯ ВКЛЮЧЕНА');
      overlay.style.transition = '';
      container.style.transition = '';
    }
    // Все остальные случаи - БЕЗ анимации
    else {
      console.log('⚡ Другой переход - АНИМАЦИЯ ОТКЛЮЧЕНА');
      overlay.style.transition = 'none';
      container.style.transition = 'none';
      
      setTimeout(() => {
        overlay.style.transition = '';
        container.style.transition = '';
      }, 50);
    }

    prevMessagesLengthRef.current = currentLength;
  }, [messages.length]);

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    const searchBox = searchBoxRef.current;

    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }

    if (searchBox && messages.length === 0) {
      const height = searchBox.offsetHeight;
      document.documentElement.style.setProperty(
        "--input-height",
        `${height}px`
      );
    }
  }, [localInput, messages.length]);

  // ✨ useCallback - функция не пересоздается при каждом рендере
  const handleSend = useCallback(async () => {
    if (!localInput.trim() || loading) return;
    
    const prompt = localInput;
    setLocalInput(""); // Очищаем сразу
    
    // ✅ Вызываем sendMessage с всеми параметрами
    await sendMessage(
      prompt,
      subject,
      isAuthenticated,
      currentChatId,
      setCurrentChatId,
      () => {}, // setChats (пустая функция, т.к. она в ChatsContext)
      loadChats
    );
  }, [localInput, loading, sendMessage, subject, isAuthenticated, currentChatId, setCurrentChatId, loadChats]);

  // ✨ useCallback для handleKeyDown
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !loading) {
      if (e.shiftKey) {
        return;
      }
      e.preventDefault();
      handleSend();
    }
  }, [loading, handleSend]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalInput(value);
    // ✅ НЕ обновляем Context - input теперь только локальный!
  };

  const overlayClasses = [
    "input-box-overlay",
    messages.length === 0 ? "empty-state" : "with-messages",
    isAuthenticated
      ? sidebarExtended
        ? "sidebar-extended"
        : "sidebar-collapsed"
      : "no-sidebar",
  ].join(" ");

  return (
    <div className={overlayClasses} ref={overlayRef}>
      <div className="input-container" ref={containerRef}>
        <div className="search-box" ref={searchBoxRef}>
          <textarea
            ref={textareaRef}
            placeholder="Enter a prompt here"
            value={localInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />
          <div className="search-box-icons">
            <img src={assets.gallery_icon} alt="" />
            <img src={assets.mic_icon} alt="" />
            {localInput && (
              <img
                className="send-icon"
                src={assets.send_icon}
                alt=""
                onClick={handleSend}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputBox;