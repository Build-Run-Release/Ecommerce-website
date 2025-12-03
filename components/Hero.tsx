
import React from 'react';
import { ArrowRight, Store } from 'lucide-react';

interface HeroProps {
  onShopNow: () => void;
  onSellClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow, onSellClick }) => {
  return (
    <div className="relative bg-ui-blue text-white overflow-hidden">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
           <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-block bg-ui-gold/20 text-ui-gold px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-ui-gold/30">
            Secure • Fast • Reliable
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-serif leading-tight mb-6">
            Your Ultimate <span className="text-ui-gold">Global Marketplace</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
            From the latest gadgets to trending fashion and daily essentials. Experience safe payments and fast delivery nationwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onShopNow}
              className="bg-ui-gold text-ui-blue px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/20"
            >
              Start Shopping <ArrowRight size={18} />
            </button>
            <button 
              onClick={onSellClick}
              className="px-8 py-3.5 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Store size={18} /> Start Selling
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Image Side */}
      <div className="hidden lg:block absolute right-0 bottom-0 w-1/3 h-full">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-ui-blue z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800" 
          alt="Online Shopping" 
          className="h-full w-full object-cover opacity-60 mix-blend-overlay"
        />
      </div>
    </div>
  );
};
