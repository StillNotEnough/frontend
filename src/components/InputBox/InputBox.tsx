import { useContext, useEffect, useRef } from "react";
import { Context } from "../../context/Context";
import { assets } from "../../assets/assets";
import "./InputBox.css";

const InputBox = () => {
  const context = useContext(Context);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error("InputBox must be used within ContextProvider");
  }

  const { input, setInput, messages, loading, sendMessage, sidebarExtended, isAuthenticated } =
    context;

  // Автоматическое изменение высоты textarea и обновление CSS переменной
  useEffect(() => {
    const textarea = textareaRef.current;
    const searchBox = searchBoxRef.current;

    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }

    // Обновляем CSS переменную с высотой search-box для пустого состояния
    if (searchBox && messages.length === 0) {
      const height = searchBox.offsetHeight;
      document.documentElement.style.setProperty(
        "--input-height",
        `${height}px`
      );
    }
  }, [input, messages.length]);

  // Обработка отправки
  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input);
  };

  // Обработка Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !loading) {
      if (e.shiftKey) {
        return; // Shift+Enter для новой строки
      }
      e.preventDefault();
      handleSend();
    }
  };

  // Определяем классы для позиционирования
  const overlayClasses = [
    "input-box-overlay",
    messages.length === 0 ? "empty-state" : "with-messages",
    // Добавляем класс только если пользователь залогинен
    isAuthenticated
      ? sidebarExtended
        ? "sidebar-extended"
        : "sidebar-collapsed"
      : "no-sidebar",
  ].join(" ");

  // ОДИН инпут для обоих состояний
  return (
    <div className={overlayClasses}>
      <div className="input-container">
        <div className="search-box" ref={searchBoxRef}>
          <textarea
            ref={textareaRef}
            placeholder="Enter a prompt here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />
          <div className="search-box-icons">
            <img src={assets.gallery_icon} alt="" />
            <img src={assets.mic_icon} alt="" />
            {input && (
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
