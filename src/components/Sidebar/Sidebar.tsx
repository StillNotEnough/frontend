// Sidebar.tsx - С DELETE CONFIRM + RENAME

import { useContext, useEffect, useRef, useState } from "react";
import { assets } from "../../assets/assets";
import Avatar from "../Avatar/Avatar";
import { Context } from "../../context/Context";
import SettingsModal from "../SettingsModal/SettingsModal";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./Sidebar.css";

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
    deleteChat,
    renameChat, // ✨ ДОБАВЛЕНО - если есть в Context
  } = context;
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openChatMenuId, setOpenChatMenuId] = useState<number | null>(null);
  
  // Для ConfirmDialog удаления
  const [chatToDelete, setChatToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // ✨ ДЛЯ RENAME - inline editing
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  
  const profileRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

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

  // ✨ Фокус на input при начале редактирования
  useEffect(() => {
    if (editingChatId !== null && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingChatId]);

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
    e.stopPropagation();
    setOpenChatMenuId(openChatMenuId === chatId ? null : chatId);
  };

  // ✨ DELETE - показываем confirm dialog
  const handleDeleteChat = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setOpenChatMenuId(null);
  };

  // ✨ DELETE - подтверждение
  const confirmDelete = async () => {
    if (chatToDelete === null) return;
    
    setIsDeleting(true);
    try {
      await deleteChat(chatToDelete);
      setChatToDelete(null);
    } catch (error) {
      console.error('Failed to delete chat:', error);
      alert('Failed to delete chat');
    } finally {
      setIsDeleting(false);
    }
  };

  // ✨ DELETE - отмена
  const cancelDelete = () => {
    setChatToDelete(null);
  };

  // ✨ RENAME - начало редактирования
  const handleRenameChat = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation();
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setEditingChatId(chatId);
      setEditingTitle(chat.title);
    }
    setOpenChatMenuId(null);
  };

  // ✨ RENAME - сохранение
  const handleRenameSave = async (chatId: number) => {
    if (!editingTitle.trim()) {
      setEditingChatId(null);
      return;
    }

    try {
      // Если есть renameChat в Context - используем
      if (typeof renameChat === 'function') {
        await renameChat(chatId, editingTitle.trim());
      } else {
        // Иначе локально обновляем (временно)
        console.log('Rename not implemented in Context, would rename to:', editingTitle);
      }
    } catch (error) {
      console.error('Failed to rename chat:', error);
    } finally {
      setEditingChatId(null);
    }
  };

  // ✨ RENAME - отмена
  const handleRenameCancel = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  // ✨ RENAME - обработка Enter/Escape
  const handleRenameKeyDown = (e: React.KeyboardEvent, chatId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSave(chatId);
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  return (
    <>
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
                  {/* ✨ ЕСЛИ РЕДАКТИРУЕМ - ПОКАЗЫВАЕМ INPUT */}
                  {editingChatId === chat.id ? (
                    <input
                      ref={renameInputRef}
                      type="text"
                      className="recent-entry-rename-input"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleRenameSave(chat.id)}
                      onKeyDown={(e) => handleRenameKeyDown(e, chat.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className="recent-entry-text">{chat.title}</p>
                  )}
                  
                  {/* Кнопка три точки - скрываем при редактировании */}
                  {editingChatId !== chat.id && (
                    <div 
                      className="recent-entry-menu-btn"
                      onClick={(e) => handleChatMenuToggle(e, chat.id)}
                    >
                      <img src={assets.dots_icon} alt="" />
                    </div>
                  )}

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

      {/* ✨ Confirm Dialog для удаления */}
      <ConfirmDialog
        isOpen={chatToDelete !== null}
        title="Delete chat"
        message="Are you sure you want to delete this chat?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default Sidebar;