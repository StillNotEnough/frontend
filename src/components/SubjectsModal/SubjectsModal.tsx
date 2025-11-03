// src/components/SubjectsModal/SubjectsModal.tsx
// ИСПРАВЛЕНО: Используем React Portal для рендеринга dropdown вне иерархии

import { type FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './SubjectsModal.css';
import { useUI } from '../../context/Context';

interface SubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

// 🎯 Конфигурация предметов
const SUBJECTS = [
  {
    id: 'general',
    name: 'General',
    description: 'General conversations and questions',
  },
  {
    id: 'math',
    name: 'Mathematics',
    description: 'Math problems, equations, and calculations',
  },
  {
    id: 'programming',
    name: 'Programming',
    description: 'Code, algorithms, and development',
  },
  {
    id: 'english',
    name: 'English',
    description: 'Language learning and practice',
  },
];

const SubjectsModal: FC<SubjectsModalProps> = ({ isOpen, onClose, buttonRef }) => {
  const { subject, setSubject } = useUI();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Вычисляем позицию dropdown относительно кнопки
  useEffect(() => {
    if (isOpen && buttonRef?.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: buttonRect.bottom + 8,
        left: buttonRect.left,
      });
    }
  }, [isOpen, buttonRef]);

  // Закрытие при клике вне dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  const handleSubjectSelect = (subjectId: string) => {
    setSubject(subjectId);
    onClose();
  };

  // 🎯 Используем Portal для рендеринга в document.body
  return createPortal(
    <div 
      className="subjects-dropdown" 
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      
      <div className="subjects-list">
        {SUBJECTS.map((subj) => (
          <div
            key={subj.id}
            className={`subject-item ${subject === subj.id ? 'active' : ''}`}
            onClick={() => handleSubjectSelect(subj.id)}
          >
            <div className="subject-item-content">
              <span className="subject-item-name">{subj.name}</span>
              <span className="subject-item-description">{subj.description}</span>
            </div>
            {subject === subj.id && (
              <div className="subject-item-check">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>,
    document.body // 🎯 Рендерим в body, минуя всю иерархию
  );
};

export default SubjectsModal;