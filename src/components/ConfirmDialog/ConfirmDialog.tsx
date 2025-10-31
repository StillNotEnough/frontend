// src/components/ConfirmDialog/ConfirmDialog.tsx - СОЗДАЙ НОВЫЙ КОМПОНЕНТ

import { type FC } from 'react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDeleting = false
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="confirm-dialog-overlay" onClick={onCancel}></div>

      {/* Dialog */}
      <div className="confirm-dialog">
        <div className="confirm-dialog-icon">
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
        
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        
        <div className="confirm-dialog-buttons">
          <button 
            className="confirm-dialog-cancel"
            onClick={onCancel}
            disabled={isDeleting}
          >
            {cancelText}
          </button>
          <button 
            className="confirm-dialog-confirm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;