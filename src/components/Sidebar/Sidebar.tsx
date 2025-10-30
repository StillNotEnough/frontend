// src/components/Sidebar/Sidebar.tsx

import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { useState, useRef, useEffect, useContext } from "react";
import Avatar from "../Avatar/Avatar";
import { Context } from "../../context/Context";
import SettingsModal from "../SettingsModal/SettingsModal";

const Sidebar = () => {
  const context = useContext(Context);
  
  if (!context) {
    throw new Error("Sidebar must be used within ContextProvider");
  }

  const { 
    sidebarExtended, 
    setSidebarExtended, 
    username, 
    logout,
    theme,
    toggleTheme,
    chats,
    currentChatId,
    createNewChat,
    selectChat,
    deleteChat
  } = context;
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openChatMenuId, setOpenChatMenuId] = useState<number | null>(null); // ID чата с открытым меню
  const profileRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);

  const userName = username || "Guest";
  const userPlan = "Free";

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
        setOpenChatMenuId(null);
      }
    };

    if (showProfileMenu || openChatMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu, openChatMenuId]);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  const handleSettingsClick = () => {
    setShowProfileMenu(false);
    setIsSettingsOpen(true);
  };

  const handleNewChat = () => {
    createNewChat();
  };

  const handleSelectChat = (chatId: number) => {
    selectChat(chatId);
  };

  // Открытие/закрытие меню чата
  const handleChatMenuToggle = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation(); // Чтобы не сработал клик по самому чату
    setOpenChatMenuId(openChatMenuId === chatId ? null : chatId);
  };

  // Удаление чата
  const handleDeleteChat = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation();
    deleteChat(chatId);
    setOpenChatMenuId(null);
  };

  // Переименование чата (пока заглушка)
  const handleRenameChat = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation();
    console.log("Rename chat:", chatId);
    setOpenChatMenuId(null);
    // TODO: Добавить логику переименования
  };

  return (
    <div className={`sidebar ${sidebarExtended ? 'extended' : 'collapsed'}`}>
      <div className="top">
        <img 
          onClick={() => setSidebarExtended(!sidebarExtended)} 
          className="menu" 
          src={assets.menu_icon} 
          alt="" 
        />
        
        <div className="new-chat" onClick={handleNewChat}>
          <img src={assets.plus_icon} alt="" />
          {sidebarExtended ? <p>New Chat</p> : null}
        </div>
        
        {sidebarExtended && chats.length > 0 && (
          <div className="recent">
            <p className="recent-title">Recents</p>
            {chats.map((chat) => (
              <div 
                key={chat.id}
                className={`recent-entry ${currentChatId === chat.id ? 'active' : ''}`}
                onClick={() => handleSelectChat(chat.id)}
              >
                <p className="recent-entry-text">{chat.title}</p>
                
                {/* Кнопка три точки */}
                <div 
                  className="recent-entry-menu-btn"
                  onClick={(e) => handleChatMenuToggle(e, chat.id)}
                >
                  <img src={assets.dots_icon} alt="" />
                </div>

                {/* Выпадающее меню чата */}
                {openChatMenuId === chat.id && (
                  <div className="chat-options-menu" ref={chatMenuRef}>
                    <div 
                      className="chat-options-item"
                      onClick={(e) => handleRenameChat(e, chat.id)}
                    >
                      <img src={assets.rename_icon} alt="" />
                      <p>Rename</p>
                    </div>
                    <div 
                      className="chat-options-item delete-item"
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                    >
                      <img src={assets.delete_icon} alt="" />
                      <p>Delete</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bottom" ref={profileRef}>
        <div 
          className="profile-section"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <Avatar name={userName} size={40} />
          {sidebarExtended && (
            <div className="profile-info">
              <p className="profile-name">{userName}</p>
              <p className="profile-plan">{userPlan}</p>
            </div>
          )}
        </div>

        {showProfileMenu && (
          <div className="profile-menu">
            <div className="profile-menu-item" onClick={handleSettingsClick}>
              <img src={assets.setting_icon} alt="" />
              <p>Settings</p>
            </div>
            <div className="profile-menu-item">
              <img src={assets.question_icon} alt="" />
              <p>Get Help</p>
            </div>
            <div className="profile-menu-item">
              <img src={assets.history_icon} alt="" />
              <p>Activity</p>
            </div>
            <div className="profile-menu-item logout-item" onClick={handleLogout}>
              <img src={assets.logout_icon} alt="" />
              <p>Log Out</p>
            </div>
          </div>
        )}
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
};

export default Sidebar;