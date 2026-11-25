import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Trash2, MessageSquare } from 'lucide-react';
import { chatAPI } from '../../services/api';
import { ChatMessage } from './ChatMessage';
import { ModeSelector } from './ModeSelector';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('explain');
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatAPI.ask(q, mode);
      const aiMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.data.answer || 'No response.',
        sources: res.data.sources || [],
        mode: res.data.mode || mode,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content:
            err.response?.data?.message ||
            'Something went wrong. Is the backend running?',
          sources: [],
          mode,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Toggle chat"
        className={`fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/40 hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105 active:scale-95 transition-all duration-300 ${
          isOpen ? 'rotate-90 scale-90' : ''
        }`}
      >
        {isOpen ? <X size={22} /> : <Sparkles size={22} />}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-fuchsia-500/40 animate-ping pointer-events-none" />
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-[60] w-[420px] max-w-[calc(100vw-3rem)] h-[620px] max-h-[calc(100vh-8rem)] rounded-2xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-2xl shadow-violet-900/20 flex flex-col overflow-hidden transition-all duration-300 ease-out origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="relative flex-shrink-0 px-5 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm leading-tight">
                StudentSathi Assistant
              </h3>
              <p className="text-white/70 text-[11px] leading-tight mt-0.5">
                Ask anything from your materials
              </p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Clear chat"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 dark:border-dark-800 bg-gray-50/50 dark:bg-dark-900/50">
          <ModeSelector mode={mode} setMode={setMode} disabled={loading} />
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth"
        >
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950/50 dark:to-fuchsia-950/50 flex items-center justify-center mb-4">
                <MessageSquare
                  size={28}
                  className="text-violet-600 dark:text-violet-400"
                />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                How can I help you study?
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[260px]">
                Ask about your syllabus, get exam questions, or practice with
                topics from your materials.
              </p>

              <div className="mt-6 w-full space-y-2">
                {[
                  'What is normalization in DBMS?',
                  'What is a linked list?',
                  'Summarize Unit 3 of my syllabus',
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-xs text-gray-700 dark:text-gray-300 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}

          {loading && (
            <div className="flex items-start gap-2.5 mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-sm">
                <Sparkles size={14} className="text-white animate-pulse" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" />
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    Searching your materials...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-gray-100 dark:border-dark-800 p-3 bg-white dark:bg-dark-900">
          <div className="flex items-end gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask about your materials..."
              className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 border border-transparent focus:border-violet-400 dark:focus:border-violet-600 focus:bg-white dark:focus:bg-dark-900 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all"
            >
              <Send size={17} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
            Grounded in college materials
          </p>
        </div>
      </div>
    </>
  );
};