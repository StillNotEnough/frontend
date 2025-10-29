// src/components/SettingsModal/SettingsModal.tsx - СОЗДАЙ НОВЫЙ ФАЙЛ

import type { FC } from 'react';
import './SettingsModal.css';
import { assets } from '../../assets/assets';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose, theme, onToggleTheme }) => {
  if (!isOpen) return null;

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
        </div>
      </div>
    </>
  );
};

export default SettingsModal;