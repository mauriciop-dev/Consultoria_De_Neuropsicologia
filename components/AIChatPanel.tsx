
import React, { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../services/geminiService';
import { marked } from 'marked';

const AIChatPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
    { role: 'model', content: '¡Hola! Soy tu asistente de NeuroAI. ¿En qué puedo ayudarte con tus pacientes hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const history = messages.map(m => ({ 
      role: m.role, 
      parts: m.content 
    }));

    const response = await chatWithGemini(userMsg, history);
    setMessages(prev => [...prev, { role: 'model', content: response || 'Lo siento, hubo un error.' }]);
    setLoading(false);
  };

  const renderMarkdown = (content: string) => {
    const html = marked.parse(content);
    return { __html: html };
  };

  return (
    <>
      {/* Floating Button (only visible when closed) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[60]">
          <button 
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            <i className="fas fa-comment-medical text-xl"></i>
          </button>
        </div>
      )}

      {/* Full Height Chat Drawer */}
      {isOpen && (
        <>
          {/* Transparent Backdrop to detect click outside */}
          <div 
            className="fixed inset-0 z-[55] bg-slate-900/10 backdrop-blur-[1px]" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="fixed inset-y-0 right-0 w-[455px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[60] flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-indigo-600 p-5 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-brain"></i>
                </div>
                <div>
                  <span className="font-bold block text-sm">Asistente Clínico AI</span>
                  <span className="text-[10px] text-indigo-100 font-medium uppercase tracking-wider">NeuroAI Support</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm markdown-content'
                    }`}
                    dangerouslySetInnerHTML={m.role === 'model' ? renderMarkdown(m.content) : undefined}
                  >
                    {m.role === 'user' ? m.content : null}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 rounded-2xl px-4 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all">
                <input 
                  className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
                  placeholder="Realizar consulta clínica..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim() || loading}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    !input.trim() || loading 
                      ? 'text-slate-300' 
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95'
                  }`}
                >
                  <i className="fas fa-paper-plane text-sm"></i>
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
                La IA puede cometer errores. Verifique información importante.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AIChatPanel;
