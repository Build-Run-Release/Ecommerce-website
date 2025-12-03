
import React, { useState } from 'react';
import { ShoppingCart, GraduationCap, Wallet, Shield, LogOut, LogIn, UserPlus, Heart, Bell, Search, Settings, Menu } from 'lucide-react';
import { User, PageView } from '../types';

interface NavbarProps {
  currentUser: User | null;
  cartCount: number;
  onCartClick: () => void;
  onNavigate: (view: PageView) => void;
  onLoginClick: () => void;
  onSignupClick?: () => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, cartCount, onCartClick, onNavigate, onLoginClick, onSignupClick, onLogout, onSearch }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearch(val);
  };

  const unreadCount = currentUser?.notifications.filter(n => !n.isRead).length || 0;

  return (
    <nav className="bg-ui-blue text-white fixed w-full z-50 shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0" 
            onClick={() => onNavigate('home')}
            >
            <div className="bg-ui-gold p-1.5 rounded-lg text-ui-blue shadow-lg shadow-black/20">
                <GraduationCap size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-tight">
                <span className="font-bold text-lg tracking-tight font-serif hidden xs:block">UI CONNECT</span>
                <span className="font-bold text-lg tracking-tight font-serif block xs:hidden">UI</span>
            </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full bg-white/10 border border-white/10 rounded-full px-4 py-2 pl-10 text-sm focus:bg-white focus:text-gray-900 focus:outline-none transition-all placeholder:text-gray-400"
                value={searchQuery}
                onChange={handleSearch}
            />
            <Search size={16} className="absolute left-3.5 top-2.5 text-gray-400" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-5 flex-shrink-0">
            {currentUser ? (
                <>
                <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                    {currentUser.role === 'admin' && (
                    <button onClick={() => onNavigate('admin')} className="text-red-300 hover:text-white flex items-center gap-1">
                        <Shield size={16} /> Admin
                    </button>
                    )}
                    <button onClick={() => onNavigate('wallet')} className="hover:text-ui-gold flex items-center gap-1">
                        <Wallet size={16} /> Wallet
                    </button>
                </div>
                
                {/* Wishlist */}
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative hidden sm:block">
                    <Heart size={20} />
                    {currentUser.wishlist.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
                
                {/* Notifications */}
                <div className="relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{unreadCount}</span>}
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden text-gray-800 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="p-3 border-b border-gray-100 font-bold text-sm bg-gray-50 flex justify-between items-center">
                                <span>Notifications</span>
                                <span onClick={() => setShowNotifications(false)} className="text-xs text-blue-600 cursor-pointer">Close</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto scrollbar-hide">
                                {currentUser.notifications.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-gray-400">No notifications</div>
                                ) : (
                                    currentUser.notifications.map(n => (
                                        <div key={n.id} className={`p-3 border-b border-gray-50 text-xs hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                                            <p className="font-medium text-gray-700">{n.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{new Date(n.date).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
                </>
            ) : (
                <div className="flex items-center gap-2">
                    <button 
                    onClick={onLoginClick}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 transition-all border border-white/20"
                    >
                    <LogIn size={16} /> <span className="hidden sm:inline">Log In</span>
                    </button>
                    <button 
                    onClick={onSignupClick || onLoginClick}
                    className="flex items-center gap-2 bg-ui-gold hover:bg-yellow-400 text-ui-blue px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg"
                    >
                    <UserPlus size={16} /> <span className="hidden sm:inline">Join</span>
                    </button>
                </div>
            )}

            {/* Cart */}
            <button 
                className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
                onClick={onCartClick}
            >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-ui-blue">
                    {cartCount}
                </span>
                )}
            </button>

            {/* User Profile */}
            {currentUser && (
                <div className="relative group ml-1">
                <div className="w-8 h-8 bg-ui-gold text-ui-blue rounded-full flex items-center justify-center font-bold cursor-pointer hover:ring-2 ring-white/50 transition-all overflow-hidden border-2 border-ui-gold">
                    {currentUser.profileImage ? <img src={currentUser.profileImage} alt="" className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl py-2 hidden group-hover:block text-gray-800 border border-gray-100 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    </div>
                    {currentUser.role === 'admin' && (
                        <button onClick={() => onNavigate('admin')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 md:hidden">
                            <Shield size={16} /> Admin Dashboard
                        </button>
                    )}
                    <button onClick={() => onNavigate('wallet')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 md:hidden">
                        <Wallet size={16} /> Wallet
                    </button>
                    <button onClick={() => onNavigate('settings')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2">
                        <Settings size={16} /> Settings
                    </button>
                    <button onClick={onLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-2">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
                </div>
            )}
            </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-4">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search for essentials..." 
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 pl-10 text-sm text-white placeholder:text-gray-300 focus:bg-white focus:text-gray-900 focus:outline-none transition-all"
                    value={searchQuery}
                    onChange={handleSearch}
                />
                <Search size={16} className="absolute left-3.5 top-2.5 text-gray-300" />
            </div>
        </div>
      </div>
    </nav>
  );
};
