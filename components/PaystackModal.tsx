
import React, { useState, useEffect } from 'react';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';

interface PaystackModalProps {
  isOpen: boolean;
  amount: number;
  email: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const PaystackModal: React.FC<PaystackModalProps> = ({ isOpen, amount, email, onSuccess, onClose }) => {
  const [step, setStep] = useState<'loading' | 'card' | 'processing' | 'success'>('loading');

  useEffect(() => {
    if (isOpen) {
      setStep('loading');
      const timer = setTimeout(() => setStep('card'), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded w-full max-w-[400px] shadow-2xl overflow-hidden relative min-h-[500px] flex flex-col">
        {/* Header */}
        <div className="bg-[#092e47] p-4 flex justify-between items-center text-white">
          <div className="flex flex-col">
            <span className="text-xs text-gray-300">UI Connect Store</span>
            <span className="font-bold">{email}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-xs text-gray-300">Pay</span>
             <span className="font-bold text-lg">₦{amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow flex flex-col p-6 relative">
          {step === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          )}

          {step === 'card' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
              <h3 className="font-bold text-gray-700 mb-4">Enter Card Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Card Number</label>
                  <div className="flex items-center border rounded p-3 bg-gray-50 mt-1">
                    <span className="text-gray-400 mr-2">💳</span>
                    <input type="text" placeholder="0000 0000 0000 0000" className="bg-transparent w-full outline-none" disabled defaultValue="4242 4242 4242 4242" />
                    <span className="text-xs font-bold text-blue-600">VISA</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Expiry</label>
                    <input type="text" placeholder="MM/YY" className="border rounded p-3 w-full mt-1 bg-gray-50" disabled defaultValue="12/25" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">CVV</label>
                    <input type="text" placeholder="123" className="border rounded p-3 w-full mt-1 bg-gray-50" disabled defaultValue="***" />
                  </div>
                </div>

                <button 
                  onClick={handlePay}
                  className="w-full bg-[#3BB75E] text-white font-bold py-4 rounded mt-6 hover:bg-[#2E9C4E] transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <Lock size={16} /> Pay ₦{amount.toLocaleString()}
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-center">
              <Loader2 className="animate-spin text-[#3BB75E] mb-4" size={48} />
              <h3 className="font-bold text-gray-700">Processing Payment...</h3>
              <p className="text-gray-500 text-sm mt-2">Do not close this window</p>
            </div>
          )}

          {step === 'success' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-center">
              <div className="w-16 h-16 bg-[#3BB75E] rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                <CheckCircle2 className="text-white" size={32} />
              </div>
              <h3 className="font-bold text-xl text-gray-800">Payment Successful</h3>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-center gap-2 text-gray-400">
          <Lock size={12} />
          <span className="text-[10px] uppercase font-bold tracking-wider">Secured by Paystack Simulation</span>
        </div>
        
        {step === 'card' && (
          <button onClick={onClose} className="absolute top-2 right-2 text-white/50 hover:text-white p-2">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
