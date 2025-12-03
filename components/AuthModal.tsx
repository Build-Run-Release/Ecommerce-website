
import React, { useState, useRef, useEffect } from 'react';
import { X, User, Lock, Mail, Phone, Hash, CreditCard, GraduationCap, Camera, Image as ImageIcon, ScanFace, Loader2, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MockBackend } from '../services/mockBackend';
import { User as UserType } from '../types';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  initialView?: 'login' | 'register';
  initialRole?: 'buyer' | 'seller'; // New prop
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
  const [isStudent, setIsStudent] = useState(true);
  const [idNumber, setIdNumber] = useState(''); // Matric or NIN
  const [refCode, setRefCode] = useState('');
  
  // Image Capture State
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<'none' | 'camera' | 'upload'>('none');
  const [isVerifyingImage, setIsVerifyingImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Effect to update internal view state if prop changes
  useEffect(() => {
    setView(initialView);
  }, [initialView, isOpen]);

  // Effect to update role if initialRole changes
  useEffect(() => {
    setRole(initialRole);
  }, [initialRole, isOpen]);

  // Cleanup camera stream on close
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
    
    // Simulate complex AI analysis steps for user feedback
    try {
        await new Promise(r => setTimeout(r, 1000)); // Step 1: Uploading
        await MockBackend.verifyImageRealness(imageData); // Step 2: Backend AI
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
      const user = await MockBackend.register(name, email, password, phone, role, isStudent, idNumber, refCode, profileImage);
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

        {/* Header Tabs */}
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

        {/* Scrollable Form Content */}
        <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold font-serif text-gray-800">
              {view === 'login' ? 'Welcome Back, Scholar' : 'Join UI Connect'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {view === 'login' ? 'Access your wallet and orders.' : 'Verified marketplace for UI students & staff.'}
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
                    placeholder="name@ui.edu.ng"
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
                <button 
                  type="button" 
                  onClick={() => toast.success('Reset link sent to your email!', { icon: '📧' })} 
                  className="text-xs text-ui-blue hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-ui-blue text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Image Capture Section */}
              <div className="mb-6 flex flex-col items-center">
                 <div className="relative w-32 h-32 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group">
                     {profileImage ? (
                         <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                     ) : isVerifyingImage ? (
                         <div className="flex flex-col items-center animate-pulse">
                             <ScanFace className="text-ui-blue mb-2 animate-bounce" size={24} />
                             <span className="text-[10px] text-ui-blue font-bold">AI Verifying...</span>
                         </div>
                     ) : captureMode === 'camera' ? (
                         <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                     ) : (
                         <div className="text-center p-2">
                             <User size={32} className="mx-auto text-gray-300 mb-1" />
                             <span className="text-[10px] text-gray-400">No Photo</span>
                         </div>
                     )}
                     
                     {/* Overlay Actions */}
                     {!isVerifyingImage && captureMode !== 'camera' && (
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <button type="button" onClick={startCamera} className="bg-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-gray-100">
                                <Camera size={12}/> Camera
                            </button>
                            <label className="bg-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-gray-100 cursor-pointer">
                                <ImageIcon size={12}/> Upload
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                            </label>
                         </div>
                     )}
                     
                     {captureMode === 'camera' && (
                         <button type="button" onClick={takePhoto} className="absolute bottom-4 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform">
                             <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                         </button>
                     )}
                 </div>
                 
                 <canvas ref={canvasRef} className="hidden" />
                 
                 <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                    {profileImage ? <span className="text-green-600 flex items-center gap-1"><CheckCircle size={10}/> AI Verified Real</span> : <span className="flex items-center gap-1"><ShieldCheck size={10}/> Anti-Fake Detection Active</span>}
                 </p>
              </div>

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <label className={`border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${role === 'buyer' ? 'bg-blue-50 border-ui-blue text-ui-blue ring-1 ring-ui-blue' : 'hover:bg-gray-50'}`}>
                  <input type="radio" className="hidden" checked={role === 'buyer'} onChange={() => setRole('buyer')} />
                  <User size={16} /> <span className="font-bold text-sm">Buyer</span>
                </label>
                <label className={`border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${role === 'seller' ? 'bg-blue-50 border-ui-blue text-ui-blue ring-1 ring-ui-blue' : 'hover:bg-gray-50'}`}>
                  <input type="radio" className="hidden" checked={role === 'seller'} onChange={() => setRole('seller')} />
                  <CreditCard size={16} /> <span className="font-bold text-sm">Seller</span>
                </label>
              </div>

              {/* Status Selection */}
              <div className="flex gap-4 text-sm mb-2">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={isStudent} onChange={() => setIsStudent(true)} className="text-ui-blue" />
                    <span>UI Student</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={!isStudent} onChange={() => setIsStudent(false)} className="text-ui-blue" />
                    <span>Non-Student / Staff</span>
                 </label>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" required placeholder="Full Name"
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full pl-10 p-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ui-blue/20 outline-none"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="email" required placeholder="Email Address"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 p-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ui-blue/20 outline-none"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="tel" required placeholder="Phone Number"
                    value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 p-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ui-blue/20 outline-none"
                  />
                </div>

                {/* Conditional Verification Field */}
                <div className="relative">
                   {isStudent ? (
                       <GraduationCap className="absolute left-3 top-3 text-gray-400" size={18} />
                   ) : (
                       <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
                   )}
                   <input 
                    type="text" required 
                    placeholder={isStudent ? "Matric Number (e.g., 215432)" : "NIN (11 Digits)"}
                    value={idNumber} onChange={e => setIdNumber(e.target.value)}
                    className="w-full pl-10 p-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ui-blue/20 outline-none"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="password" required placeholder="Create Password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 p-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ui-blue/20 outline-none"
                  />
                </div>

                <input 
                   type="text" placeholder="Referral Code (Optional)"
                   value={refCode} onChange={e => setRefCode(e.target.value)}
                   className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white text-sm"
                />
              </div>

              <button 
                disabled={loading || !profileImage}
                className="w-full bg-ui-blue text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Sign Up'}
              </button>
            </form>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
           By continuing, you agree to UI Connect's Terms & Conditions.
        </div>
      </div>
    </div>
  );
};
