
import React from 'react';
import { Product } from '../types';
import { X, Truck, ShieldCheck, Star } from 'lucide-react';
import { ProductReviews } from './ProductReviews';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  currentUserId?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose, onAddToCart, currentUserId }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Side */}
          <div className="md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
             <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
          </div>

          {/* Info Side */}
          <div className="md:w-1/2 p-6 md:p-8">
            <div className="mb-4">
              <span className="bg-blue-50 text-ui-blue px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <h2 className="text-2xl font-bold text-gray-800 mt-2 leading-tight">{product.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                 <Star size={16} className="text-yellow-500" fill="currentColor" />
                 <span className="font-bold text-gray-700">{product.rating}</span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Truck size={18} className="text-ui-blue" />
                <span>Estimated Delivery: <span className="font-bold text-gray-800">{product.estimatedDelivery}</span></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <ShieldCheck size={18} className="text-green-600" />
                <span>Escrow Protected Transaction</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
               <span className="text-3xl font-bold text-ui-blue">₦{product.price.toLocaleString()}</span>
               <button 
                  onClick={() => { onAddToCart(product); onClose(); }}
                  disabled={!product.inStock}
                  className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${product.inStock ? 'bg-ui-gold text-ui-blue hover:bg-yellow-400' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
               </button>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50/50">
            <ProductReviews productId={product.id} currentUserId={currentUserId} />
        </div>
      </div>
    </div>
  );
};
