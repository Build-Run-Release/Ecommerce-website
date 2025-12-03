
import React from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onUpdateQuantity,
  onCheckout
}) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const DELIVERY_FEE = 500;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-xl font-bold font-serif text-ui-blue flex items-center gap-2">
            <ShoppingBag size={20} /> My Cart ({items.length})
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-400">
              <ShoppingBag size={48} className="opacity-20" />
              <p>Your cart is empty.</p>
              <button 
                onClick={onClose}
                className="text-ui-blue font-semibold hover:underline"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800 line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-ui-blue">₦{item.price.toLocaleString()}</span>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 hover:bg-gray-50 text-gray-500"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 hover:bg-gray-50 text-gray-500"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        onClick={() => onRemove(item.id)}
                        className="text-red-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery (Campus)</span>
                <span>₦{DELIVERY_FEE}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-ui-blue pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>₦{(total + DELIVERY_FEE).toLocaleString()}</span>
              </div>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-ui-blue text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Secure Checkout <ArrowRight size={20} />
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              2FA Protected & Escrow Secured
            </p>
          </div>
        )}
      </div>
    </>
  );
};
