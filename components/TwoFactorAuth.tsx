
import React, { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface TwoFactorAuthProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ isOpen, onSuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    
    // Simulate API verification delay
    setTimeout(() => {
      if (code === '123456') { // Mock correct code
        setVerifying(false);
        onSuccess();
      } else {
        setVerifying(false);
        toast.error('Invalid code. Try 123456');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-50 text-ui-blue rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-bold text-center">Security Verification</h2>
          <p className="text-sm text-gray-500 text-center mt-2">
            Enter the 6-digit code sent to your UI student email for payment authorization.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full text-center text-3xl tracking-[0.5em] font-mono font-bold border-2 border-gray-200 rounded-xl py-3 mb-6 focus:border-ui-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            placeholder="000000"
            autoFocus
          />
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={code.length !== 6 || verifying}
              className="flex-1 bg-ui-blue text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {verifying ? <Loader2 className="animate-spin" size={20} /> : 'Verify'}
            </button>
          </div>
        </form>
        
        <p className="text-xs text-center text-gray-400 mt-4">
          Demo Code: 123456
        </p>
      </div>
    </div>
  );
};
