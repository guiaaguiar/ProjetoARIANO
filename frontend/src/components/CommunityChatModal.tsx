import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Users, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface CommunityChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: any;
}

export const CommunityChatModal: React.FC<CommunityChatModalProps> = ({ isOpen, onClose, community }) => {
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  // Simple mock data persistence using LocalStorage based on community ID
  useEffect(() => {
    if (isOpen && community) {
      const stored = localStorage.getItem(`ariano_chat_${community.id}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        // Initial mock message
        setMessages([
          {
            id: 1,
            author: 'Sistema',
            text: `Bem-vindo à comunidade de ${community.name}. Conecte-se com pesquisadores do seu cluster.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true
          }
        ]);
      }
    }
  }, [isOpen, community]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !community) return;

    const newMessage = {
      id: Date.now(),
      author: user?.name || 'Você',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false,
      isMe: true
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    localStorage.setItem(`ariano_chat_${community.id}`, JSON.stringify(newMessages));
    setMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && community && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg h-[600px] flex flex-col bg-card/60 backdrop-blur-2xl border border-primary/20 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-primary/20 bg-card/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-1">
                  <ShieldCheck className="w-3 h-3" /> Comunidade Restrita
                </div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {community.name}
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.isSystem ? 'items-center' : msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  {msg.isSystem ? (
                    <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium my-2">
                      {msg.text}
                    </div>
                  ) : (
                    <div className={`max-w-[80%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-bold text-muted-foreground">{msg.author}</span>
                        <span className="text-[9px] text-muted-foreground/60">{msg.time}</span>
                      </div>
                      <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                        msg.isMe 
                          ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-md shadow-primary/20' 
                          : 'bg-muted/80 text-foreground border border-border rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-card/60 border-t border-border">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mensagem para a comunidade..."
                  className="w-full pl-4 pr-12 py-3 bg-muted/30 border border-border rounded-xl text-[13px] focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="absolute right-2 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
