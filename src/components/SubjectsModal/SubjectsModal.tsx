// src/components/SubjectsModal/SubjectsModal.tsx

import { type FC } from 'react';
import './SubjectsModal.css';
import { assets } from '../../assets/assets';
import { useUI } from '../../context/Context';

interface SubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 🎯 Конфигурация предметов
const SUBJECTS = [
  {
    id: 'general',
    name: 'General',
    description: 'General conversations and questions',
    icon: assets.general_icon,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'math',
    name: 'Mathematics',
    description: 'Math problems, equations, and calculations',
    icon: assets.math_icon,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 'programming',
    name: 'Programming',
    description: 'Code, algorithms, and development',
    icon: assets.code_icon,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 'english',
    name: 'English',
    description: 'Language learning and practice',
    icon: assets.english_icon,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
];

const SubjectsModal: FC<SubjectsModalProps> = ({ isOpen, onClose }) => {
  const { subject, setSubject } = useUI();

  if (!isOpen) return null;

  const handleSubjectSelect = (subjectId: string) => {
    setSubject(subjectId);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="subjects-overlay" onClick={onClose}></div>

      {/* Modal */}
      <div className="subjects-modal">
        <div className="subjects-header">
          <h2>Choose Subject</h2>
          <button className="subjects-close-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="subjects-content">
          <p className="subjects-description">
            Select a subject to get specialized AI assistance
          </p>

          <div className="subjects-grid">
            {SUBJECTS.map((subj) => (
              <div
                key={subj.id}
                className={`subject-card ${subject === subj.id ? 'active' : ''}`}
                onClick={() => handleSubjectSelect(subj.id)}
                style={{
                  background: subject === subj.id ? subj.gradient : undefined,
                }}
              >
                <div className="subject-card-icon">
                  <img src={subj.icon} alt={subj.name} />
                </div>
                <div className="subject-card-content">
                  <h3 className="subject-card-title">{subj.name}</h3>
                  <p className="subject-card-description">{subj.description}</p>
                </div>
                {subject === subj.id && (
                  <div className="subject-card-check">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SubjectsModal;