import { useContext, useLayoutEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";
import "./Main.css";

interface MainProps {
  onOpenAuthModal: (modal: 'login' | 'signup') => void;
}

const Main = ({ onOpenAuthModal }: MainProps) => {
  const mainRef = useRef<HTMLDivElement>(null);
  // --- ref для ПОСЛЕДНЕГО ОТПРАВЛЕННОГО пользователем сообщения (до ответа ИИ) ---
  const lastSentUserMessageRef = useRef<HTMLDivElement>(null);

  // --- ref для отслеживания предыдущего состояния messages ---
  const previousMessagesRef = useRef<any[]>([]); // Лучше заменить на конкретный тип, например Message[], если он определён

  const context = useContext(Context);

  if (!context) {
    // <-- Проверка сразу после получения
    throw new Error("Main must be used within ContextProvider");
  }

  // Деструктуризация *после* проверки
  const {
    input,
    messages,
    loading,
    setSubject,
    sidebarExtended,
    isAuthenticated,
  } = context;

  // --- useLayoutEffect для автоскролла ---
  useLayoutEffect(() => {
    // Получаем предыдущее состояние messages
    const prevMessages = previousMessagesRef.current;
    // Обновляем ref на текущее состояние
    previousMessagesRef.current = messages;

    // Проверяем, добавилось ли новое сообщение ИИ сразу после сообщения юзера
    if (messages.length > prevMessages.length) {
      const lastMessage = messages[messages.length - 1];
      const secondToLastMessage = messages[messages.length - 2];

      if (
        lastMessage.role === "assistant" &&
        secondToLastMessage &&
        secondToLastMessage.role === "user"
      ) {
        console.log(
          "Обнаружено новое сообщение ИИ после сообщения юзера. Пытаемся прокрутить к юзерскому сообщению."
        );

        if (lastSentUserMessageRef.current && mainRef.current) {
          console.log(
            "Прокручиваем к сообщению юзера (предпоследнему в списке)."
          );
          const messageElement = lastSentUserMessageRef.current;
          const containerElement = mainRef.current;

          const offsetTop = messageElement.offsetTop;
          console.log("offsetTop сообщения юзера:", offsetTop);
          console.log("Текущий scrollTop .main:", containerElement.scrollTop);

          containerElement.scrollTop = offsetTop;
          console.log(
            "Установлен scrollTop .main:",
            containerElement.scrollTop
          );
        } else {
          console.log(
            "Ref на сообщение юзера не установлен или mainRef отсутствует."
          );
        }
      }
    }
  }, [messages]); // <-- Зависимость: только messages

  // Выбор предмета при клике на карточку
  const handleCardClick = (selectedSubject: string) => {
    setSubject(selectedSubject.toLowerCase());
  };

  return (
    <div className="main" ref={mainRef}>
      {/* НОВЫЙ NAV */}
      <div className="nav">
        <p>NoNameAI</p>

        {/* Показываем кнопки только если НЕ залогинен */}
        {!isAuthenticated && (
          <div className="auth-buttons">
            <button
              className="auth-btn login-btn"
              onClick={() => onOpenAuthModal("login")}
            >
              Log in
            </button>
            <button
              className="auth-btn signup-btn"
              onClick={() => onOpenAuthModal("signup")}
            >
              Sign up
            </button>
          </div>
        )}
      </div>

      <div
        className={`main-container ${
          messages.length > 0 ? "has-messages" : ""
        } ${sidebarExtended ? "sidebar-extended" : "sidebar-collapsed"}`}
      >
        {messages.length === 0 ? (
          <div className="empty-state-wrapper">
            <div className="greet">
              <p>
                <span className="span">What's new, Matvey?</span>
              </p>
            </div>

            <div className="input-box-placeholder"></div>

            {!input.trim() && (
              <div className="cards">
                <div
                  className="card"
                  onClick={() => handleCardClick("general")}
                >
                  <img src={assets.compass_icon} alt="" />
                  <p>General</p>
                </div>
                <div className="card" onClick={() => handleCardClick("math")}>
                  <img src={assets.bulb_icon} alt="" />
                  <p>Mathematics</p>
                </div>
                <div
                  className="card"
                  onClick={() => handleCardClick("programming")}
                >
                  <img src={assets.code_icon} alt="" />
                  <p>Programming</p>
                </div>
                <div
                  className="card"
                  onClick={() => handleCardClick("english")}
                >
                  <img src={assets.message_icon} alt="" />
                  <p>English</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="result">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role}`}
                // --- УСЛОВНОЕ НАЗНАЧЕНИЕ REFA ---
                // Устанавливаем ref на сообщение юзера, если за ним сразу идёт сообщение ИИ.
                ref={
                  msg.role === "user" &&
                  messages[index + 1] &&
                  messages[index + 1].role === "assistant"
                    ? lastSentUserMessageRef
                    : null
                }
              >
                <div className="message-content">
                  {msg.role === "assistant" ? (
                    <div className="message-text">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeHighlight, rehypeKatex]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message assistant">
                <div className="message-content">
                  <div className="loader">
                    <hr />
                    <hr />
                    <hr />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
