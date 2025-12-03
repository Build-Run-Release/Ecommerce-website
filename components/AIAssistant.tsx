import React, { useState } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { searchProductsWithAI } from '../services/geminiService';
import { Product } from '../types';

interface AIAssistantProps {
  onProductsFound: (products: Product[]) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onProductsFound }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponseMsg(null);
    
    try {
      const result = await searchProductsWithAI(query);
      setResponseMsg(result.message);
      if (result.matchedProducts.length > 0) {
        onProductsFound(result.matchedProducts);
      }
    } catch (err) {
      setResponseMsg("Sorry, I had trouble thinking about that.");
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'bg-gray-800 rotate-45' : 'bg-gradient-to-r from-ui-gold to-yellow-400 hover:scale-110 animate-bounce-slow'
        } text-ui-blue`}
      >
        {isOpen ? <PlusIcon className="hidden" /> : <Sparkles size={24} strokeWidth={2.5} />}
        {isOpen && <X size={24} className="text-white" />}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-40 border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          <div className="bg-ui-blue p-4 flex items-center gap-3">
            <div className="bg-ui-gold p-2 rounded-full">
              <Sparkles size={16} className="text-ui-blue" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Campus AI Assistant</h3>
              <p className="text-xs text-blue-200">Ask me anything about shopping!</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 flex-grow min-h-[200px] max-h-[300px] overflow-y-auto">
            {!responseMsg && !isLoading && (
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>Try asking:</p>
                <div className="mt-2 space-y-2">
                  <span className="block bg-white border px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-gray-50" onClick={() => setQuery("I need books for 100 level")}>"I need books for 100 level"</span>
                  <span className="block bg-white border px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-gray-50" onClick={() => setQuery("Something to eat under 2k")}>"Something to eat under 2k"</span>
                  <span className="block bg-white border px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-gray-50" onClick={() => setQuery("Hostel essentials for freshers")}>"Hostel essentials for freshers"</span>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="flex items-center justify-center h-full text-ui-blue">
                <Loader2 className="animate-spin" size={24} />
                <span className="ml-2 text-sm font-medium">Thinking...</span>
              </div>
            )}

            {responseMsg && (
              <div className="bg-blue-50 text-slate-700 p-3 rounded-xl rounded-tl-none text-sm border border-blue-100 shadow-sm">
                {responseMsg}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you need..."
              className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ui-blue/20"
            />
            <button 
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-ui-blue text-white p-2 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

// Helper for the close icon trick
const PlusIcon = ({ className }: {className?: string}) => <span className={className}>+</span>;