// src/components/Message/Message.tsx - СОЗДАЙ НОВЫЙ КОМПОНЕНТ

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
}

// ✨ React.memo предотвращает перерендер если props не изменились
const Message = memo(({ role, content }: MessageProps) => {
  return (
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
  );
});

Message.displayName = 'Message';

export default Message;