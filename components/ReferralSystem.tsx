
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { QrCode, Camera, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReferralSystemProps {
  currentUser?: User | null;
  onRegisterWithCode: (code: string) => void;
}

export const ReferralSystem: React.FC<ReferralSystemProps> = ({ currentUser, onRegisterWithCode }) => {
  const [showScanner, setShowScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);

  // QR Code Generation for existing user
  const qrData = currentUser 
    ? `https://uiconnect.edu.ng/register?ref=${currentUser.referralCode}` 
    : '';

  // Simulate Camera Scanning
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (showScanner) {
      setScanning(true);
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          // Mock successful scan after 3 seconds
          setTimeout(() => {
             handleScanSuccess("REF_MOCK_123");
          }, 3500);
        })
        .catch(err => {
          toast.error("Could not access camera for scanning.");
          setShowScanner(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showScanner]);

  const handleScanSuccess = (code: string) => {
    setScanning(false);
    setShowScanner(false);
    onRegisterWithCode(code); // Trigger registration flow with code
    toast.success("QR Code Detected! Redirecting to registration...");
  };

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      {!currentUser ? (
        <div className="text-center">
            <h3 className="font-bold text-gray-800 mb-2">New to UI Connect?</h3>
            <button 
                onClick={() => setShowScanner(true)}
                className="bg-ui-blue text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full hover:bg-blue-800 transition-colors shadow-lg"
            >
                <Camera size={20} /> Scan Referral QR to Register
            </button>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
          <h3 className="font-bold text-ui-blue mb-1">Your Referral Code</h3>
          <p className="text-sm text-gray-600 mb-4">Earn ₦500 for every student who registers via your code.</p>
          
          <div className="bg-white p-4 rounded-xl shadow-sm inline-block mb-4 border border-gray-200">
            {/* Mock QR Visualization */}
            <div className="w-32 h-32 bg-gray-900 flex items-center justify-center rounded-lg text-white">
                <QrCode size={64} />
            </div>
          </div>
          
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 font-mono font-bold text-lg tracking-wider text-gray-700 select-all cursor-pointer hover:bg-gray-50">
            {currentUser.referralCode}
          </div>
          <p className="text-xs text-gray-400 mt-2">Referrals: {currentUser.referralsCount}</p>
        </div>
      )}

      {/* Scanner Overlay */}
      {showScanner && (
        <div className="fixed inset-0 bg-black z-[80] flex flex-col items-center justify-center">
          <button 
            onClick={() => setShowScanner(false)}
            className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full"
          >
            <X size={24} />
          </button>
          
          <div className="relative w-72 h-72 border-2 border-ui-gold rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.3)]">
            <video 
                ref={videoRef} 
                className="w-full h-full object-cover" 
                muted 
                playsInline 
            />
            {scanning && (
                <div className="absolute inset-0 border-t-2 border-red-500 animate-[scan_2s_ease-in-out_infinite] opacity-50"></div>
            )}
          </div>
          
          <p className="text-white mt-6 font-medium animate-pulse flex items-center gap-2">
            <Loader2 className="animate-spin" /> Searching for Referral QR...
          </p>
        </div>
      )}
    </div>
  );
};
