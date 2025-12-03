
import React from 'react';
import { ShoppingCart, Menu, GraduationCap, Wallet, Shield, LogOut, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { User, PageView } from '../types';

interface NavbarProps {
  currentUser: User | null;
  cartCount: number;
  onCartClick: () => void;
  onNavigate: (view: PageView) => void;
  onLoginClick: () => void;
  onSignupClick?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, cartCount, onCartClick, onNavigate, onLoginClick, onSignupClick, onLogout }) => {
  return (
    <nav className="bg-ui-blue text-white fixed w-full z-50 shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity" 
          onClick={() => onNavigate('home')}
        >
          <div className="bg-ui-gold p-1.5 rounded-lg text-ui-blue shadow-lg shadow-black/20">
            <GraduationCap size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-lg tracking-tight font-serif hidden xs:block">UI CONNECT</span>
            <span className="font-bold text-lg tracking-tight font-serif block xs:hidden">UI</span>
            <span className="text-[10px] text-ui-gold tracking-widest uppercase font-semibold">First & Best</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-6">
          {currentUser ? (
            <div className="flex items-center gap-2 md:gap-4 text-sm font-medium">
               {/* Role Badge - Hidden on very small screens */}
               <span className="hidden sm:flex px-2 py-0.5 rounded bg-white/10 text-xs uppercase tracking-wide text-gray-300 border border-white/10 items-center gap-1">
                 {currentUser.isStudent ? <GraduationCap size={10}/> : <UserIcon size={10}/>}
                 {currentUser.role}
               </span>

               <button onClick={() => onNavigate('home')} className="hidden md:block hover:text-ui-gold transition-colors">Shop</button>
               
               <button onClick={() => onNavigate('wallet')} className="hover:text-ui-gold transition-colors flex items-center gap-2">
                 <Wallet size={18} /> <span className="hidden md:inline">Wallet</span>
               </button>

               {currentUser.role === 'admin' && (
                 <button onClick={() => onNavigate('admin')} className="hover:text-red-400 transition-colors flex items-center gap-2">
                   <Shield size={18} /> <span className="hidden md:inline">Admin</span>
                 </button>
               )}
            </div>
          ) : (
             <div className="flex items-center gap-2">
                <button 
                  onClick={onLoginClick}
                  className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 transition-all border border-white/20"
                >
                  <LogIn size={16} /> <span className="hidden sm:inline">Log In</span>
                </button>
                <button 
                  onClick={onSignupClick || onLoginClick}
                  className="flex items-center gap-2 bg-ui-gold hover:bg-yellow-400 text-ui-blue px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all shadow-lg hover:shadow-yellow-500/20"
                >
                   <UserPlus size={16} /> <span className="hidden sm:inline">Sign Up</span>
                   <span className="inline sm:hidden">Join</span>
                </button>
             </div>
          )}

          {/* Cart */}
          <button 
            className="p-2 hover:bg-white/10 rounded-full transition-colors relative ml-1"
            onClick={onCartClick}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-ui-blue animate-in zoom-in duration-200">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Logout */}
          {currentUser && (
            <div className="relative group ml-1">
               <div className="w-8 h-8 md:w-9 md:h-9 bg-ui-gold text-ui-blue rounded-full flex items-center justify-center font-bold cursor-pointer hover:ring-2 ring-white/50 transition-all overflow-hidden border-2 border-ui-gold">
                 {currentUser.profileImage ? (
                   <img src={currentUser.profileImage} alt={currentUser.name} className="w-full h-full object-cover" />
                 ) : (
                   currentUser.name.charAt(0)
                 )}
               </div>
               <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl py-2 hidden group-hover:block text-gray-800 border border-gray-100 animate-in fade-in slide-in-from-top-2 z-50">
                 <div className="px-4 py-3 border-b border-gray-100">
                   <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                   <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                 </div>
                 <button onClick={onLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-2">
                    <LogOut size={16} /> Sign Out
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
