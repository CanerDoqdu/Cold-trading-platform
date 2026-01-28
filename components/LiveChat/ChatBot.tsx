'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UseAuthContext } from '@/hooks/UseAuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hey! 👋 I'm Liva, your AI crypto assistant powered by Llama 3.3. Ask me anything about crypto, trading, DeFi, NFTs, or portfolio strategies!",
    timestamp: new Date(),
  },
];

export default function ChatBot() {
  const { state } = UseAuthContext();
  const { user } = state;
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Listen for global event to open chat
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('openLivaChat', handleOpenChat);
    return () => window.removeEventListener('openLivaChat', handleOpenChat);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => inputRef.current?.focus(), 0);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || "I'm sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <>
      {/* Modern Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl transition-all duration-500 flex items-center justify-center ${
          isOpen
            ? 'bg-gray-800/90 backdrop-blur-xl rotate-180 scale-90'
            : 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 hover:scale-110 hover:shadow-purple-500/40 hover:shadow-2xl'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.35 17L2 22L7 20.65C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12H8.01M12 12H12.01M16 12H16.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse ring-2 ring-black" />
          </>
        )}
      </button>

      {/* Modern Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 overflow-hidden transition-all duration-500 ease-out
            bottom-24 right-6 w-[380px] max-w-[calc(100vw-48px)]
            ${isMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-120px)]'}
          `}
          style={{
            background: 'linear-gradient(180deg, rgba(17,17,27,0.98) 0%, rgba(10,10,15,0.99) 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 25px 80px -12px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.1)',
          }}
        >
          {/* Glassmorphism Header */}
          <div 
            className={`px-5 flex items-center justify-between ${isMinimized ? 'h-full py-0' : 'py-4'}`}
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.1) 100%)',
              borderBottom: isMinimized ? 'none' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Animated Avatar */}
              <div className="relative">
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #4F46E5 100%)',
                    boxShadow: '0 4px 15px rgba(139,92,246,0.4)',
                  }}
                >
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-gray-900" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-[15px] tracking-tight">Liva AI</h3>
                <p className="text-gray-400 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Powered by Llama 3.3
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200"
                title="Clear chat"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div 
                className="h-[calc(100%-140px)] overflow-y-auto px-4 py-4 space-y-4"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(139,92,246,0.3) transparent',
                }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 mt-1"
                        style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}
                      >
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-3 ${
                        message.role === 'user'
                          ? 'rounded-2xl rounded-br-md'
                          : 'rounded-2xl rounded-bl-md'
                      }`}
                      style={{
                        background: message.role === 'user' 
                          ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                          : 'rgba(255,255,255,0.05)',
                        border: message.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <p className="text-[14px] text-white leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-[10px] mt-2 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center mr-2"
                      style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}
                    >
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div 
                      className="px-5 py-4 rounded-2xl rounded-bl-md"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Modern Input Area */}
              <div 
                className="absolute bottom-0 left-0 right-0 p-4"
                style={{
                  background: 'linear-gradient(180deg, transparent 0%, rgba(10,10,15,1) 30%)',
                }}
              >
                {!user && (
                  <p className="text-[11px] text-gray-500 mb-2 text-center">
                    <a href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">Sign in</a> for personalized responses
                  </p>
                )}
                <div 
                  className="flex items-center gap-2 p-1.5 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything..."
                    className="flex-1 bg-transparent px-4 py-3 text-[14px] text-white placeholder-gray-500 focus:outline-none"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-3 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: input.trim() && !isLoading 
                        ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
                        : 'rgba(255,255,255,0.05)',
                      boxShadow: input.trim() && !isLoading ? '0 4px 15px rgba(139,92,246,0.4)' : 'none',
                    }}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
