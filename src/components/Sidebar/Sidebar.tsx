// src/components/Sidebar/Sidebar.tsx - ПОЛНЫЙ ИТОГОВЫЙ ФАЙЛ

import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { useState, useRef, useEffect, useContext } from "react";
import Avatar from "../Avatar/Avatar";
import { Context } from "../../context/Context";
import { useNavigate } from "react-router-dom";
import SettingsModal from "../SettingsModal/SettingsModal"; // НОВОЕ: импорт модалки

const Sidebar = () => {
  const context = useContext(Context);
  const navigate = useNavigate();
  
  if (!context) {
    throw new Error("Sidebar must be used within ContextProvider");
  }

  // ОБНОВЛЕНО: добавлены theme и toggleTheme
  const { 
    sidebarExtended, 
    setSidebarExtended, 
    username, 
    logout,
    theme,        // НОВОЕ
    toggleTheme   // НОВОЕ
  } = context;
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // НОВОЕ: состояние модалки
  const profileRef = useRef<HTMLDivElement>(null);

  // Данные пользователя из Context
  const userName = username || "Guest";
  const userPlan = "Free";

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  // Функция для выхода
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenu(false);
  };

  // НОВОЕ: Функция для открытия настроек
  const handleSettingsClick = () => {
    setShowProfileMenu(false); // Закрываем профильное меню
    setIsSettingsOpen(true);   // Открываем модалку настроек
  };

  return (
    <div className={`sidebar ${sidebarExtended ? 'extended' : 'collapsed'}`}>
      <div className="top">
        <img onClick={() => setSidebarExtended(!sidebarExtended)} className="menu" src={assets.menu_icon} alt="" />
        <div className="new-chat">
          <img src={assets.plus_icon} alt="" />
          {sidebarExtended ? <p>New Chat</p> : null}
        </div>
        {sidebarExtended ? (
          <div className="recent">
            <p className="recent-title">Recent</p>
            <div className="recent-entry">
              <img src={assets.message_icon} alt="" />
              <p>What is react ...</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Профиль внизу */}
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

        {/* Выпадающее меню */}
        {showProfileMenu && (
          <div className="profile-menu">
            {/* ОБНОВЛЕНО: добавлен onClick */}
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

      {/* НОВОЕ: Модалка настроек */}
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