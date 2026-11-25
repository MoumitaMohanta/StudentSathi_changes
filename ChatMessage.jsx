import React from 'react';
import { Bot, AlertTriangle } from 'lucide-react';
import { SourceCard } from './SourceCard';

// Minimal markdown renderer for LLM output:
// handles ## headings, numbered lists, bold **text**, and paragraph breaks.
const renderInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const renderContent = (text) => {
  const lines = text.split('\n');
  const out = [];
  let listBuffer = [];

  const flushList = () => {
    if (listBuffer.length) {
      out.push(
        <ol
          key={`l-${out.length}`}
          className="list-decimal list-inside space-y-1.5 my-2 pl-1"
        >
          {listBuffer}
        </ol>
      );
      listBuffer = [];
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) {
      flushList();
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      out.push(
        <h4
          key={`h-${idx}`}
          className="font-bold text-sm mt-3 mb-1.5 text-violet-700 dark:text-violet-300"
        >
          {renderInline(line.slice(3))}
        </h4>
      );
    } else if (/^\d+\.\s+/.test(line)) {
      listBuffer.push(
        <li key={`li-${idx}`} className="text-sm leading-relaxed">
          {renderInline(line.replace(/^\d+\.\s+/, ''))}
        </li>
      );
    } else if (line.startsWith('- ')) {
      flushList();
      out.push(
        <p key={`p-${idx}`} className="text-sm leading-relaxed my-1 pl-3">
          • {renderInline(line.slice(2))}
        </p>
      );
    } else {
      flushList();
      out.push(
        <p key={`p-${idx}`} className="text-sm leading-relaxed my-1.5">
          {renderInline(line)}
        </p>
      );
    }
  });
  flushList();
  return out;
};

export const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const isGeneralWarning = message.mode === 'general' && !isUser;

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-sm leading-relaxed shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-sm">
        <Bot size={16} className="text-white" />
      </div>

      <div className="flex-1 min-w-0 max-w-[88%]">
        {isGeneralWarning && (
          <div className="flex items-start gap-2 mb-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <AlertTriangle
              size={14}
              className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
            />
            <p className="text-[11px] leading-snug text-amber-800 dark:text-amber-200">
              Not from your materials — verify with your textbook.
            </p>
          </div>
        )}

        <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 text-gray-800 dark:text-gray-100 shadow-sm">
          {renderContent(message.content)}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2.5 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 pl-1">
              Sources ({message.sources.length})
            </p>
            {message.sources.map((s, i) => (
              <SourceCard key={i} source={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};