
import React, { useState } from 'react';
import { User, Lock, Save, Loader2, X } from 'lucide-react';
import { User as UserType } from '../types';
import { MockBackend } from '../services/mockBackend';
import toast from 'react-hot-toast';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onUpdate: (user: UserType) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ isOpen, onClose, currentUser, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      name: currentUser.name,
      phoneNumber: currentUser.phoneNumber,
      password: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const updated = MockBackend.updateProfile(currentUser.id, {
              name: formData.name,
              phoneNumber: formData.phoneNumber,
              password: formData.password || undefined
          });
          onUpdate(updated);
          toast.success("Profile updated successfully!");
          onClose();
      } catch (e: any) {
          toast.error(e.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h2 className="text-xl font-bold text-gray-800">Account Settings</h2>
             <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                    {currentUser.profileImage ? (
                        <img src={currentUser.profileImage} className="w-full h-full object-cover" alt="" />
                    ) : (
                        <span className="text-3xl font-bold text-gray-400">{currentUser.name.charAt(0)}</span>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-9 p-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-1 focus:ring-ui-blue outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password (Optional)</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full pl-9 p-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-1 focus:ring-ui-blue outline-none"
                    />
                </div>
            </div>

            <button 
                type="submit" disabled={loading}
                className="w-full bg-ui-blue text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 mt-4"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18}/> Save Changes</>}
            </button>
        </form>
      </div>
    </div>
  );
};
