// src/components/Main/Main.tsx - С КНОПКОЙ SUBJECTS И DROPDOWN

import { useLayoutEffect, useRef, useMemo, useState } from "react";
import { assets } from "../../assets/assets";
import { useMessages, useUI, useAuth } from "../../context/Context";
import type { Message as ChatMessage } from "../../context/messagesContext";
import Message from "../Message/Message";
import SubjectsModal from "../SubjectsModal/SubjectsModal";
import "./Main.css";

interface MainProps {
  onOpenAuthModal: (modal: "login" | "signup") => void;
}

const Main = ({ onOpenAuthModal }: MainProps) => {
  const mainRef = useRef<HTMLDivElement>(null);
  const lastSentUserMessageRef = useRef<HTMLDivElement>(null);
  const previousMessagesRef = useRef<ChatMessage[]>([]);

  // 🎯 Refs для dropdown
  const subjectsButtonRef = useRef<HTMLButtonElement>(null);
  const [isSubjectsDropdownOpen, setIsSubjectsDropdownOpen] = useState(false);

  // ✅ Используем разделенные контексты
  const { messages, loading } = useMessages();
  const { sidebarExtended, setSubject, subject } = useUI();
  const { isAuthenticated, user, username } = useAuth();


  // ✨ ОПТИМИЗАЦИЯ: useMemo для рендера сообщений
  const renderedMessages = useMemo(() => {
    return messages.map((msg, index) => {
      const isLastUserMessage =
        msg.role === "user" &&
        messages[index + 1] &&
        messages[index + 1].role === "assistant";

      return (
        <div
          key={index}
          className={`message ${msg.role}`}
          ref={isLastUserMessage ? lastSentUserMessageRef : null}
        >
          <Message role={msg.role} content={msg.content} />
        </div>
      );
    });
  }, [messages]);

  // useLayoutEffect для автоскролла
  useLayoutEffect(() => {
    const prevMessages = previousMessagesRef.current;
    previousMessagesRef.current = messages;

    if (messages.length > prevMessages.length) {
      const lastMessage = messages[messages.length - 1];
      const secondToLastMessage = messages[messages.length - 2];

      if (
        lastMessage.role === "assistant" &&
        secondToLastMessage &&
        secondToLastMessage.role === "user"
      ) {
        if (lastSentUserMessageRef.current && mainRef.current) {
          const messageElement = lastSentUserMessageRef.current;
          const containerElement = mainRef.current;
          const offsetTop = messageElement.offsetTop;
          containerElement.scrollTop = offsetTop;
        }
      }
    }
  }, [messages]);

  // Выбор предмета при клике на карточку
  const handleCardClick = (selectedSubject: string) => {
    setSubject(selectedSubject.toLowerCase());
  };

  // 🎯 Получаем название текущего предмета
  const getSubjectDisplayName = () => {
    const subjectNames: Record<string, string> = {
      general: "General",
      math: "Mathematics",
      programming: "Programming",
      english: "English",
    };
    return subjectNames[subject] || "General";
  };

  // 🎯 Toggle dropdown
  const toggleSubjectsDropdown = () => {
    setIsSubjectsDropdownOpen(!isSubjectsDropdownOpen);
  };

  const displayName = user?.username || username || "Guest";

  return (
    <div className="main" ref={mainRef}>
      <div className="nav">
        {/* 🎯 КНОПКА SUBJECTS С DROPDOWN */}
        <div className="subjects-button-wrapper">
          <button
            ref={subjectsButtonRef}
            className="subjects-nav-button"
            onClick={toggleSubjectsDropdown}
          >
            <span>{getSubjectDisplayName()}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{
                transform: isSubjectsDropdownOpen
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* DROPDOWN */}
          <SubjectsModal
            isOpen={isSubjectsDropdownOpen}
            onClose={() => setIsSubjectsDropdownOpen(false)}
            buttonRef={subjectsButtonRef}
          />
        </div>

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
                <span className="span">What's new, {displayName}?</span>
              </p>
            </div>

            <div className="input-box-placeholder"></div>

            <div className="cards">
              <div className="card" onClick={() => handleCardClick("general")}>
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
              <div className="card" onClick={() => handleCardClick("english")}>
                <img src={assets.message_icon} alt="" />
                <p>English</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="result">
            {renderedMessages}

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
