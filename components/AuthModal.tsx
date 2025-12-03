
import React, { useState, useRef, useEffect } from 'react';
import { X, User, Lock, Mail, Phone, Hash, CreditCard, Camera, Image as ImageIcon, ScanFace, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { MockBackend } from '../services/mockBackend';
import { User as UserType } from '../types';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  initialView?: 'login' | 'register';
  initialRole?: 'buyer' | 'seller';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  initialView = 'login',
  initialRole = 'buyer' 
}) => {
  const [view, setView] = useState<'login' | 'register'>(initialView);
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register Specific State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>(initialRole);
  const [refCode, setRefCode] = useState('');
  
  // Image Capture State
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<'none' | 'camera' | 'upload'>('none');
  const [isVerifyingImage, setIsVerifyingImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setView(initialView);
  }, [initialView, isOpen]);

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole, isOpen]);

  useEffect(() => {
    if (!isOpen || captureMode !== 'camera') {
      stopCamera();
    }
  }, [isOpen, captureMode]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    setCaptureMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      toast.error("Unable to access camera. Please check permissions.");
      setCaptureMode('none');
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        processImage(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData: string) => {
    setCaptureMode('none');
    stopCamera();
    setIsVerifyingImage(true);
    
    try {
        await new Promise(r => setTimeout(r, 1000)); 
        await MockBackend.verifyImageRealness(imageData);
        setProfileImage(imageData);
        toast.success("Image Verified: Real Person Detected", { icon: '✅' });
    } catch (e) {
        toast.error("Image verification failed. Please try a clearer photo.");
    } finally {
        setIsVerifyingImage(false);
    }
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await MockBackend.login(email, password);
      if (user) {
        toast.success(`Welcome back, ${user.name}!`);
        onLoginSuccess(user);
        onClose();
      } else {
        toast.error("Invalid credentials");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileImage) {
        toast.error("Please provide a verified profile picture to continue.");
        return;
    }

    setLoading(true);
    try {
      // General registration without student details
      const user = await MockBackend.register(name, email, password, phone, role, refCode, profileImage);
      toast.success("Account created successfully!");
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md relative overflow-hidden flex flex-col max-h-[90vh]">
        <button onClick={() => { onClose(); stopCamera(); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <X size={24} />
        </button>

        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setView('login')}
            className={`flex-1 py-4 font-bold text-sm transition-colors ${view === 'login' ? 'text-ui-blue border-b-2 border-ui-blue bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Log In
          </button>
          <button 
            onClick={() => setView('register')}
            className={`flex-1 py-4 font-bold text-sm transition-colors ${view === 'register' ? 'text-ui-blue border-b-2 border-ui-blue bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Create Account
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold font-serif text-gray-800">
              {view === 'login' ? 'Welcome Back' : 'Join Connect Market'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {view === 'login' ? 'Access your wallet and orders.' : 'Verified marketplace for everyone.'}
            </p>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ui-blue/20 bg-gray-50 focus:bg-white transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ui-blue/20 bg-gray-50 focus:bg-white transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="text-right">
                 <button type="button" onClick={() => toast("Reset link sent to your email", {icon: '📧'})} className="text-xs text-ui-gold font-bold hover:underline">Forgot password?</button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-ui-blue text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg flex justify-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Log In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
               {/* Role Selection */}
              <div className="flex gap-2 mb-2 p-1 bg-gray-100 rounded-lg">
                  <button 
                    type="button" 
                    onClick={() => setRole('buyer')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${role === 'buyer' ? 'bg-white text-ui-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      I want to Buy
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRole('seller')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${role === 'seller' ? 'bg-white text-ui-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      I want to Sell
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                    <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ui-blue/20 bg-gray-50 focus:bg-white"
                        placeholder="John Doe"
                    />
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                    <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="tel" 
                        required 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ui-blue/20 bg-gray-50 focus:bg-white"
                        placeholder="080..."
                    />
                    </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ui-blue/20 bg-gray-50 focus:bg-white"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ui-blue/20 bg-gray-50 focus:bg-white"
                    placeholder="Create a strong password"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Referral Code (Optional)</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={refCode}
                    onChange={e => setRefCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ui-blue/20 bg-gray-50 focus:bg-white"
                    placeholder="Enter code if you have one"
                  />
                </div>
              </div>

              {/* Profile Image Capture */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                     Profile Verification {profileImage && <CheckCircle size={14} className="text-green-500"/>}
                </label>
                
                {!profileImage && captureMode === 'none' && (
                    <div className="flex gap-2">
                        <button type="button" onClick={startCamera} className="flex-1 py-3 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-ui-blue hover:text-ui-blue transition-colors">
                            <Camera size={24} className="mb-1" />
                            <span className="text-xs font-bold">Use Camera</span>
                        </button>
                        <label className="flex-1 py-3 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-ui-blue hover:text-ui-blue transition-colors cursor-pointer">
                            <ImageIcon size={24} className="mb-1" />
                            <span className="text-xs font-bold">Upload Photo</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                    </div>
                )}
                
                {captureMode === 'camera' && (
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                        <button type="button" onClick={takePhoto} className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        </button>
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )}

                {isVerifyingImage && (
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-100">
                        <Loader2 className="animate-spin text-ui-gold" />
                        <div className="text-xs">
                            <p className="font-bold">Analyzing biometric data...</p>
                            <p className="text-gray-400">Checking for generative artifacts...</p>
                        </div>
                    </div>
                )}
                
                {profileImage && !isVerifyingImage && (
                    <div className="relative h-20 bg-gray-50 rounded-xl flex items-center p-2 gap-3 border border-gray-100">
                        <img src={profileImage} alt="Preview" className="h-16 w-16 rounded-lg object-cover bg-gray-200" />
                        <div>
                            <p className="text-sm font-bold text-green-600 flex items-center gap-1"><ShieldCheck size={14}/> Verified Real</p>
                            <button type="button" onClick={() => setProfileImage(null)} className="text-xs text-red-500 underline">Retake</button>
                        </div>
                    </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading || isVerifyingImage}
                className="w-full bg-ui-gold text-ui-blue py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg flex justify-center mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
