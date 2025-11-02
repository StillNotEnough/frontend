// src/components/SettingsModal/SettingsModal.tsx - С РАЗДЕЛЕННЫМИ КОНТЕКСТАМИ

import type { FC } from 'react';
import { useState } from 'react';
import './SettingsModal.css';
import { assets } from '../../assets/assets';
import { useChats } from '../../context/Context'; // ✅ ИЗМЕНИЛИ ИМПОРТ

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose, theme, onToggleTheme }) => {
  // ✅ Используем useChats вместо Context
  const { deleteAllChats } = useChats();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleDeleteAllChats = async () => {
    setIsDeleting(true);
    try {
      await deleteAllChats();
      setShowConfirm(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete all chats:', error);
      alert('Ошибка при удалении чатов');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Overlay с блюром */}
      <div className="settings-overlay" onClick={onClose}></div>

      {/* Модальное окно */}
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="settings-content">
          {/* Секция персонализации */}
          <div className="settings-section">
            <h3 className="section-title">Personalization</h3>
            
            <div className="settings-item">
              <div className="settings-item-left">
                <img 
                  src={theme === 'light' ? assets.moon_icon : assets.sun_icon} 
                  alt="Theme" 
                  className="settings-icon"
                />
                <div className="settings-item-text">
                  <p className="settings-item-label">Theme</p>
                  <p className="settings-item-description">
                    {theme === 'light' ? 'Light mode' : 'Dark mode'}
                  </p>
                </div>
              </div>
              
              <button 
                className="theme-toggle-button"
                onClick={onToggleTheme}
              >
                <img 
                  src={theme === 'light' ? assets.moon_icon : assets.sun_icon} 
                  alt="Toggle theme" 
                />
              </button>
            </div>
          </div>

          {/* ✨ ДОБАВЛЕНО: Data & Privacy */}
          <div className="settings-section">
            <h3 className="section-title">Data & Privacy</h3>
            
            <div 
              className="settings-item" 
              style={{ 
                borderColor: theme === 'dark' ? '#4a2020' : '#ffcccc', 
                backgroundColor: theme === 'dark' ? '#2d1f1f' : '#fff9f9' 
              }}
            >
              <div className="settings-item-left">
                <svg 
                  className="settings-icon" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  stroke="#d32f2f"
                  strokeWidth="2"
                  style={{ filter: 'none' }}
                >
                  <path 
                    d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="settings-item-text">
                  <p className="settings-item-label">Delete all chats</p>
                  <p className="settings-item-description">
                    Permanently delete all your chat history
                  </p>
                </div>
              </div>
              
              <button 
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isDeleting ? 0.6 : 1,
                  flexShrink: 0
                }}
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = '#b71c1c';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#d32f2f';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>

        {/* ✨ ДОБАВЛЕНО: Confirm Dialog */}
        {showConfirm && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000
            }}
          >
            <div 
              style={{
                backgroundColor: theme === 'dark' ? '#2d2d2d' : 'white',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="#d32f2f" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: theme === 'dark' ? '#e0e0e0' : '#282828',
                textAlign: 'center',
                margin: '0 0 12px 0'
              }}>
                Delete All Chats?
              </h3>
              
              <p style={{
                fontSize: '14px',
                color: theme === 'dark' ? '#a1a1a1' : '#666',
                textAlign: 'center',
                lineHeight: 1.5,
                margin: '0 0 24px 0'
              }}>
                This will permanently delete all your chats and messages. This action cannot be undone.
              </p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    border: 'none',
                    backgroundColor: theme === 'dark' ? '#3c3c3c' : '#f0f4f9',
                    color: theme === 'dark' ? '#e0e0e0' : '#282828',
                    opacity: isDeleting ? 0.6 : 1
                  }}
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  onMouseEnter={(e) => {
                    if (!isDeleting) {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4a4a4a' : '#e2e6eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#3c3c3c' : '#f0f4f9';
                  }}
                >
                  Cancel
                </button>
                <button 
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    border: 'none',
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    opacity: isDeleting ? 0.6 : 1
                  }}
                  onClick={handleDeleteAllChats}
                  disabled={isDeleting}
                  onMouseEnter={(e) => {
                    if (!isDeleting) {
                      e.currentTarget.style.backgroundColor = '#b71c1c';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#d32f2f';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsModal;