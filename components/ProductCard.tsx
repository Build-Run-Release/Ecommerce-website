
import React, { useState } from 'react';
import { Plus, Star, Truck, Eye, Heart } from 'lucide-react';
import { Product } from '../types';
import { MockBackend } from '../services/mockBackend';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  currentUserId?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onViewDetails, currentUserId }) => {
  const [inWishlist, setInWishlist] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!currentUserId) return toast.error("Please login first");
      MockBackend.toggleWishlist(currentUserId, product.id);
      setInWishlist(!inWishlist);
      toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col h-full relative">
      <div 
        className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-700">
          {product.category}
        </div>
        
        {/* Wishlist Button */}
        <button 
            onClick={toggleWishlist}
            className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors z-20"
        >
            <Heart size={18} fill={inWishlist ? "currentColor" : "none"} className={inWishlist ? "text-red-500" : ""} />
        </button>

        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
             <span className="bg-red-500 text-white px-3 py-1 rounded font-bold text-sm">Out of Stock</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                <Eye size={16} /> View Details
            </button>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-2 leading-tight hover:text-ui-blue cursor-pointer" onClick={() => onViewDetails(product)}>
            {product.name}
          </h3>
        </div>
        
        <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center gap-3 mb-4">
             <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium">
                <Star size={14} fill="currentColor" />
                <span>{product.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs font-medium bg-gray-50 px-2 py-0.5 rounded">
                <Truck size={12} />
                <span>{product.estimatedDelivery}</span>
            </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-ui-blue">
            ₦{product.price.toLocaleString()}
          </span>
          
          <button 
            onClick={() => onAdd(product)}
            disabled={!product.inStock}
            className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${
              product.inStock 
                ? 'bg-ui-blue text-white hover:bg-ui-gold hover:text-ui-blue' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};
