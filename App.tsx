
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { AIAssistant } from './components/AIAssistant';
import { CartDrawer } from './components/CartDrawer';
import { TwoFactorAuth } from './components/TwoFactorAuth';
import { PaystackModal } from './components/PaystackModal';
import { WalletView } from './components/WalletView';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ReferralSystem } from './components/ReferralSystem';
import { AuthModal } from './components/AuthModal'; 
import { ProfileSettings } from './components/ProfileSettings';
import { Product, CartItem, PageView, User } from './types';
import { MockBackend } from './services/mockBackend';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<PageView>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<'buyer' | 'seller'>('buyer');
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  
  // Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Initial Data Load
    setProducts(MockBackend.getProducts());
    
    // Auto-maintenance (Cron Job Simulation)
    MockBackend.runDailyMaintenance();
    
    // Poll for bans if logged in
    const interval = setInterval(() => {
        if (currentUser) {
            // Check if user still exists/is banned in DB
            const users = MockBackend.getAllUsers();
            const freshUser = users.find(u => u.id === currentUser.id);
            if (!freshUser) {
                handleLogout(); // Deleted
                toast.error("Session expired.");
            } else if (freshUser.isBanned) {
                handleLogout();
                toast.error("Account has been suspended.");
            }
        }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleAddToCart = (product: Product) => {
    if (!currentUser) {
        setAuthView('login');
        setAuthRole('buyer');
        setIsAuthModalOpen(true);
        toast("Please login to shop");
        return;
    }
    if (currentUser.isBanned) { toast.error("Account suspended."); return; }
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCheckoutInit = () => {
    if (!currentUser) { setAuthView('login'); setIsAuthModalOpen(true); return; }
    setIsCartOpen(false);
    setIs2FAOpen(true); 
  };

  const handle2FASuccess = () => { setIs2FAOpen(false); setIsPaystackOpen(true); };

  const handlePaymentSuccess = async () => {
    setIsPaystackOpen(false);
    if (!currentUser) return;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 500;
    try {
      await MockBackend.createOrder(currentUser.id, cart, total);
      setCart([]);
      setView('wallet'); 
    } catch (e) { console.error(e); }
  };

  const handleLoginSuccess = (user: User) => {
      setCurrentUser(user);
      setProducts(MockBackend.getProducts());
  };
  
  const handleLogout = () => {
      setCurrentUser(null);
      setView('home');
      setCart([]);
  };

  const handleSellClick = () => {
      if (currentUser) {
          if (currentUser.role === 'seller') {
              setView('wallet');
              toast.success("Welcome to your dashboard");
          } else {
              toast("You are currently a Buyer.", { icon: 'ℹ️' });
          }
      } else {
          setAuthView('register');
          setAuthRole('seller');
          setIsAuthModalOpen(true);
      }
  };

  const filterByCategory = (category: string) => {
    setActiveCategory(category);
    const allProducts = MockBackend.getProducts();
    if (category === 'All') {
      setProducts(allProducts);
    } else {
      setProducts(allProducts.filter(p => p.category === category));
    }
  };

  const handleSearch = (query: string) => {
    const allProducts = MockBackend.getProducts();
    if (!query.trim()) {
        filterByCategory(activeCategory);
        return;
    }
    const lowerQuery = query.toLowerCase();
    setProducts(allProducts.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.description.toLowerCase().includes(lowerQuery)
    ));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Navigate Handler
  const handleNavigate = (page: PageView) => {
      if (page === 'settings') {
          setIsSettingsOpen(true);
      } else {
          setView(page);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Toaster position="bottom-right" />
      
      <Navbar 
        currentUser={currentUser}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)}
        onNavigate={handleNavigate}
        onLoginClick={() => { setAuthView('login'); setIsAuthModalOpen(true); }}
        onSignupClick={() => { setAuthView('register'); setIsAuthModalOpen(true); }}
        onLogout={handleLogout}
        onSearch={handleSearch}
      />

      <main className="flex-grow pt-32 md:pt-16">
        {view === 'home' && (
          <>
            <Hero onShopNow={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })} onSellClick={handleSellClick} />
            <div id="products-section" className="container mx-auto px-4 py-12">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-ui-blue font-serif mb-4 md:mb-0">Campus Essentials</h2>
                <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
                  {['All', 'Merch', 'Books', 'Food', 'Gadgets', 'Hostel'].map(cat => (
                    <button key={cat} onClick={() => filterByCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeCategory === cat ? 'bg-ui-blue text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <ProductGrid products={products} onAddToCart={handleAddToCart} onViewDetails={handleViewDetails} />
            </div>
            <AIAssistant onProductsFound={setProducts} />
          </>
        )}

        {view === 'wallet' && currentUser && (
          <>
            <WalletView currentUser={currentUser} />
            <div className="container mx-auto px-4 pb-12 max-w-5xl">
                <ReferralSystem currentUser={currentUser} onRegisterWithCode={() => {}} />
            </div>
          </>
        )}

        {view === 'admin' && currentUser?.role === 'admin' && <AdminDashboard />}
      </main>

      {/* Modals */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={(id) => setCart(p => p.filter(i => i.id !== id))} onUpdateQuantity={(id, d) => setCart(p => p.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} onCheckout={handleCheckoutInit} />
      <TwoFactorAuth isOpen={is2FAOpen} onSuccess={handle2FASuccess} onCancel={() => setIs2FAOpen(false)} />
      <PaystackModal isOpen={isPaystackOpen} amount={cartTotal + 500} email={currentUser?.email || ''} onSuccess={handlePaymentSuccess} onClose={() => setIsPaystackOpen(false)} />
      <ProductDetailModal isOpen={isProductModalOpen} product={selectedProduct} onClose={() => setIsProductModalOpen(false)} onAddToCart={handleAddToCart} currentUserId={currentUser?.id} />
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={handleLoginSuccess} initialView={authView} initialRole={authRole} />
      
      {currentUser && (
          <ProfileSettings 
              isOpen={isSettingsOpen} 
              onClose={() => setIsSettingsOpen(false)} 
              currentUser={currentUser}
              onUpdate={setCurrentUser}
          />
      )}

      <footer className="bg-ui-blue text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="opacity-80">© {new Date().getFullYear()} UI Connect Store.</p>
        </div>
      </footer>
    </div>
  );
}
