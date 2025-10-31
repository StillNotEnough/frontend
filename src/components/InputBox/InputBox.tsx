// InputBox.tsx - ФИНАЛЬНАЯ ВЕРСИЯ (убираем расширение/сужение)

import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Context } from "../../context/Context";
import { assets } from "../../assets/assets";
import "./InputBox.css";

const InputBox = () => {
  const context = useContext(Context);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // ✨ НОВЫЙ REF для контейнера
  
  const [localInput, setLocalInput] = useState("");
  
  const prevMessagesLengthRef = useRef(0);

  if (!context) {
    throw new Error("InputBox must be used within ContextProvider");
  }

  const { input, setInput, messages, loading, sendMessage, sidebarExtended, isAuthenticated } =
    context;

  useEffect(() => {
    if (input === "") {
      setLocalInput("");
    }
  }, [input]);

  const updateContextInput = useCallback((value: string) => {
    setInput(value);
  }, [setInput]);

  // ✨ ОБНОВЛЕНО: Отключаем transition и на overlay, и на container
  useEffect(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current; // ✨ НОВОЕ
    if (!overlay || !container) return;

    const prevLength = prevMessagesLengthRef.current;
    const currentLength = messages.length;

    console.log(`📊 Messages: ${prevLength} → ${currentLength}`);

    // Анимация ТОЛЬКО при переходе 0 → 1 (первое сообщение)
    if (prevLength === 0 && currentLength === 1) {
      console.log('✨ ПЕРВОЕ СООБЩЕНИЕ - АНИМАЦИЯ ВКЛЮЧЕНА');
      overlay.style.transition = '';
      container.style.transition = ''; // ✨ ВКЛЮЧАЕМ на контейнере тоже
    }
    // Все остальные случаи - БЕЗ анимации
    else {
      console.log('⚡ Другой переход - АНИМАЦИЯ ОТКЛЮЧЕНА');
      overlay.style.transition = 'none';
      container.style.transition = 'none'; // ✨ ОТКЛЮЧАЕМ на контейнере тоже
      
      setTimeout(() => {
        overlay.style.transition = '';
        container.style.transition = ''; // ✨ ВОЗВРАЩАЕМ на контейнере тоже
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

  const handleSend = () => {
    if (!localInput.trim() || loading) return;
    sendMessage(localInput);
    setLocalInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !loading) {
      if (e.shiftKey) {
        return;
      }
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalInput(value);
    updateContextInput(value);
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
      <div className="input-container" ref={containerRef}> {/* ✨ ДОБАВИЛИ REF */}
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