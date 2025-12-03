
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, Mic, MicOff, ShoppingBag, ChevronRight, Plus } from 'lucide-react';
import { searchProductsWithAI } from '../services/geminiService';
import { Product } from '../types';
import toast from 'react-hot-toast';

interface AIAssistantProps {
  onProductsFound: (products: Product[]) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  products?: Product[];
  timestamp: number;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onProductsFound }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! 👋 I'm your Connect Market assistant. Looking for fashion, electronics, or home essentials today?",
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Listening...", { icon: '🎤' });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.start();
  };

  const handleSubmit = async (e?: React.FormEvent, manualQuery?: string) => {
    if (e) e.preventDefault();
    const textToSend = manualQuery || query;
    if (!textToSend.trim()) return;

    // Add User Message
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const result = await searchProductsWithAI(textToSend);
      
      // Add AI Response
      const aiMsg: Message = {
        id: `a_${Date.now()}`,
        sender: 'ai',
        text: result.message,
        products: result.matchedProducts,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
      // Also update main grid if requested
      if (result.matchedProducts.length > 0) {
        onProductsFound(result.matchedProducts);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: "I'm having trouble connecting right now. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for quick actions
  const sendQuickReply = (text: string) => {
    handleSubmit(undefined, text);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'bg-gray-800 rotate-90 scale-90' : 'bg-gradient-to-r from-ui-gold to-yellow-400 hover:scale-110 animate-bounce-slow'
        } text-ui-blue`}
      >
        {isOpen ? <X size={24} className="text-white" /> : <Sparkles size={24} strokeWidth={2.5} />}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl z-[60] border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300 font-sans">
          
          {/* Header */}
          <div className="bg-ui-blue p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-ui-gold p-2 rounded-full ring-2 ring-white/20">
                <Sparkles size={18} className="text-ui-blue" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Shopping Assistant</h3>
                <p className="text-xs text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setMessages([])} className="text-blue-200 hover:text-white text-xs">Clear</button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-ui-blue text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                  
                  {/* Product Carousel inside Chat */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 w-full flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {msg.products.map(product => (
                        <div key={product.id} className="min-w-[140px] w-[140px] bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onProductsFound([product])}>
                          <div className="h-24 bg-gray-100">
                            <img src={product.image} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="p-2">
                            <p className="font-bold text-xs truncate">{product.name}</p>
                            <p className="text-ui-blue text-xs font-bold">₦{product.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 shadow-sm">
                  <Loader2 className="animate-spin text-ui-gold" size={16} />
                  <span className="text-xs text-gray-500 font-medium">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {!isLoading && messages.length < 3 && (
            <div className="px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
               <button onClick={() => sendQuickReply("Cheap headphones")} className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs hover:bg-ui-blue hover:text-white hover:border-ui-blue transition-colors whitespace-nowrap">🎧 Headphones</button>
               <button onClick={() => sendQuickReply("Best selling books")} className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs hover:bg-ui-blue hover:text-white hover:border-ui-blue transition-colors whitespace-nowrap">📚 Books</button>
               <button onClick={() => sendQuickReply("Gadgets under 10k")} className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs hover:bg-ui-blue hover:text-white hover:border-ui-blue transition-colors whitespace-nowrap">📱 Gadgets</button>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={(e) => handleSubmit(e)} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-3 rounded-xl transition-colors ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask for anything..."}
              className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ui-blue/20"
            />
            
            <button 
              type="submit" 
              disabled={isLoading || (!query.trim() && !isListening)}
              className="bg-ui-blue text-white p-3 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-lg"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
