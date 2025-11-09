// src/components/Message/Message.tsx

import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

// @ts-ignore
import copyIcon from '../../assets/copy_icon.png';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const Message = memo(({ role, content }: MessageProps) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Через 2 сек вернуть обратно
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Определяем когда показывать кнопку
  const showCopyButton = role === 'assistant' || isHovered;

  return (
    <div 
      className={`message-wrapper ${role}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="message-content">
        {role === 'assistant' ? (
          <div className="message-text">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeHighlight, rehypeKatex]}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p>{content}</p>
        )}
      </div>

      {/* 🔥 КНОПКА КОПИРОВАНИЯ */}
      {showCopyButton && (
        <button
          className="copy-button"
          onClick={handleCopy}
          title={copied ? 'Скопировано!' : 'Копировать'}
        >
          {copied ? (
            <span className="copy-success">✓</span>
          ) : (
            <img src={copyIcon} alt="Copy" />
          )}
        </button>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.role === nextProps.role &&
    prevProps.content === nextProps.content
  );
});

Message.displayName = 'Message';

export default Message;