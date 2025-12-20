// src/components/Message/Message.tsx

import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import './Message.css'
import copyIcon from '../../assets/copy_icon.png';
import checkIcon from '../../assets/check_icon.png';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const Message = memo(({ role, content }: MessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Через 2 сек вернуть обратно
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className={`message-wrapper ${role}`}>
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

      {/* 🔥 КНОПКА КОПИРОВАНИЯ - только для AI */}
      {role === 'assistant' && (
        <button
          className="copy-button"
          onClick={handleCopy}
          title={copied ? 'Скопировано!' : 'Копировать'}
        >
          {copied ? (
            <img src={checkIcon} alt="Copied" />
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
