
import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { MockBackend } from '../services/mockBackend';
import { Category } from '../types';
import toast from 'react-hot-toast';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  onSuccess: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, sellerId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      price: '',
      category: 'Merch' as Category,
      description: '',
      estimatedDelivery: '24 Hours'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      
      try {
          // Simulate network delay
          setTimeout(() => {
              MockBackend.addProduct(sellerId, {
                  name: formData.name,
                  price: parseFloat(formData.price),
                  category: formData.category,
                  description: formData.description,
                  estimatedDelivery: formData.estimatedDelivery
              });
              toast.success("Product listed successfully!");
              onSuccess();
              onClose();
              setLoading(false);
          }, 1000);
      } catch (e) {
          toast.error("Failed to list product");
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-ui-blue">List New Product</h2>
            <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ui-blue/20 outline-none"
                    placeholder="e.g. Engineering Textbook"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₦)</label>
                    <input 
                        type="number" required
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        className="w-full border rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ui-blue/20 outline-none"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value as Category})}
                        className="w-full border rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ui-blue/20 outline-none"
                    >
                        {['Merch', 'Books', 'Food', 'Gadgets', 'Hostel', 'Services'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full border rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ui-blue/20 outline-none"
                    rows={3}
                    placeholder="Describe condition, details..."
                />
            </div>
            
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-sm text-gray-500 font-medium">Click to upload product image</p>
                <p className="text-xs text-gray-400">(Simulated Upload)</p>
            </div>

            <button 
                type="submit" disabled={loading}
                className="w-full bg-ui-blue text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex justify-center items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={20}/> : 'List Product'}
            </button>
        </form>
      </div>
    </div>
  );
};
