
import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { sendMessageStreaming } from './services/gemini';
import { Send, TrendingUp, Zap, Target, DollarSign, Cpu, Menu, X, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: 'Terminal Alpha online. Protocolos de performance carregados. Aguardando diretrizes.',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: currentInput,
      timestamp: Date.now(),
    };

    // Keep history excluding current placeholder and including actual previous messages
    const historyForApi = messages.filter(m => m.text !== '');

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, botMsg]);

    try {
      let fullText = '';
      const stream = sendMessageStreaming(currentInput, historyForApi);
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => 
          prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m)
        );
      }
    } catch (error) {
      console.error("Send Error:", error);
      setMessages(prev => 
        prev.map(m => m.id === botMsgId ? { ...m, text: "Falha na conexão segura. Reinicie o terminal." } : m)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-zinc-100 selection:bg-white/20">
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-md"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`
        fixed lg:relative z-40 w-64 h-full bg-black border-r border-zinc-900 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-zinc-100 rounded flex items-center justify-center">
              <Shield className="text-black" size={18} />
            </div>
            <h1 className="text-lg font-black tracking-widest">TERMINAL</h1>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem icon={<DollarSign size={16} />} label="Patrimônio" active />
            <SidebarItem icon={<Zap size={16} />} label="Exponencial" />
            <SidebarItem icon={<Target size={16} />} label="Aquisição" />
            <SidebarItem icon={<Cpu size={16} />} label="Escala" />
          </nav>

          <div className="mt-auto p-4 border border-zinc-900 rounded-lg">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
              Encriptação Ativa
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <header className="p-4 border-b border-zinc-900 flex justify-between items-center bg-black/50 backdrop-blur-md">
          <div className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">
            Private Access // Alpha Channel
          </div>
          <div className="text-[10px] font-mono text-zinc-700">
            {new Date().toISOString().split('T')[0]}
          </div>
        </header>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 pb-32"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] md:max-w-[65%] p-5 rounded-lg
                ${msg.role === 'user' 
                  ? 'bg-zinc-100 text-black font-bold' 
                  : 'bg-zinc-900/50 border border-zinc-800 text-zinc-300'}
              `}>
                <div className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                  {isLoading && msg.id === messages[messages.length - 1].id && msg.role === 'model' && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-white animate-pulse"></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 md:p-8 bg-gradient-to-t from-black via-black to-transparent">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Comando operacional..."
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 outline-none p-4 rounded-lg text-white"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 text-black px-6 rounded-lg font-black transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <div className={`
    flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-all
    ${active ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'}
  `}>
    {icon}
    <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

export default App;
