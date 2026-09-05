import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Mail, User, ShieldCheck, ArrowRight, CheckCircle2, 
  Eye, EyeOff, Phone, Upload, Camera, Sparkles, LogIn, ArrowLeft, Image as ImageIcon
} from 'lucide-react';
import { UserProfile } from '../types';
import { TactileMonogramIcon } from './TactileMonogramLogo';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onAuthenticate: (userData: Partial<UserProfile>) => void;
}

const PRESET_AVATARS = [
  {
    name: 'Noir Architect',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Studio Specialist',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Audiophile Noir',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cyber Tactile',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Veluno Curator',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Workspace Engineer',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80'
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onAuthenticate
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [registerStep, setRegisterStep] = useState<1 | 2>(1); // 1: Auth Info, 2: Profile Setup

  // Profile Form State
  const [email, setEmail] = useState('valentinine14feb@gmail.com');
  const [password, setPassword] = useState('velunoSecure2026');
  const [name, setName] = useState('Valentin');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0].url);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Sync mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
    if (initialMode === 'register') {
      setRegisterStep(1);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Handle Image File Upload (Convert to DataURL for live preview)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Login Submit (Direct routing to main dashboard)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Authentication successful! Directing to Veluno Dashboard...');
      
      setTimeout(() => {
        onAuthenticate({
          name: name || 'Valentin',
          email: email || 'valentinine14feb@gmail.com',
          phone: phone || '+91 98765 43210',
          avatar: avatar || PRESET_AVATARS[0].url,
          isAuthenticated: true
        });
        onClose();
      }, 600);
    }, 500);
  };

  // Google OAuth Simulation
  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Authenticated via Google OAuth 2.0 Secure Session');
      setTimeout(() => {
        onAuthenticate({
          name: 'Valentin (Google)',
          email: 'valentinine14feb@gmail.com',
          phone: '+91 98765 43210',
          avatar: PRESET_AVATARS[0].url,
          isAuthenticated: true
        });
        onClose();
      }, 600);
    }, 500);
  };

  // Step 1 Register Submit -> Transition to Profile Setup Onboarding
  const handleRegisterStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setRegisterStep(2); // Proceed to Profile Setup view
    }, 400);
  };

  // Step 2 Profile Setup Submit -> Save and redirect to main Veluno dashboard
  const handleProfileSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Profile Onboarding Complete! Launching Veluno Dashboard...');

      setTimeout(() => {
        onAuthenticate({
          name: name.trim() || 'Valentin',
          email: email.trim() || 'valentinine14feb@gmail.com',
          phone: phone.trim() || '+91 98765 43210',
          avatar: avatar,
          isAuthenticated: true
        });
        onClose();
      }, 700);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Dark Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn"
      />

      {/* Auth Card Container */}
      <div 
        id="auth-modal-card"
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/95 z-10 backdrop-blur-2xl animate-scaleUp text-zinc-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header: Isolated 'V' Monogram Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-2.5 hover:scale-105 transition-transform cursor-pointer" onClick={() => setMode('login')}>
            <TactileMonogramIcon className="w-10 h-10 drop-shadow-md" />
          </div>
          
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {mode === 'login' 
              ? 'Welcome Back to Veluno' 
              : (registerStep === 1 ? 'Create Veluno Account' : 'Veluno Profile Setup')}
          </h2>

          <p className="text-xs text-zinc-400 mt-1 max-w-xs font-light">
            {mode === 'login' && 'Sign in securely to your sovereign cart & active checkout sessions'}
            {mode === 'register' && registerStep === 1 && 'Join the premier destination for tactile architecture and agentic commerce'}
            {mode === 'register' && registerStep === 2 && 'Personalize your concierge profile, communication line, and avatar'}
          </p>
        </div>

        {/* Tab Switcher (Sign In vs Register) */}
        {registerStep === 1 && (
          <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setRegisterStep(1);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'login' 
                  ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60 font-bold' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegisterStep(1);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'register' 
                  ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60 font-bold' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* MODE 1: LOGIN FORM */}
        {mode === 'login' && (
          <div>
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-zinc-800" />
              <span className="absolute px-3 bg-zinc-950 text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                or sign in with email
              </span>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="valentinine14feb@gmail.com"
                    className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-mono"
                  />
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-400">
                    Password
                  </label>
                  <button type="button" className="text-[10px] text-zinc-500 hover:text-zinc-300">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full py-2.5 pl-9 pr-9 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-mono"
                  />
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    id="login-password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/80"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-zinc-400" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-[0.98] transition-all mt-4"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    Authenticating Session...
                  </span>
                ) : (
                  <>
                    <span>Sign In & Access Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* MODE 2 - STEP 1: REGISTER CREDENTIALS */}
        {mode === 'register' && registerStep === 1 && (
          <form onSubmit={handleRegisterStep1Submit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Valentin"
                  className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="valentinine14feb@gmail.com"
                  className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full py-2.5 pl-9 pr-9 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  id="register-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/80"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-zinc-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-[0.98] transition-all mt-4"
            >
              <span>Continue to Profile Setup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* MODE 2 - STEP 2: PROFILE SETUP ONBOARDING VIEW */}
        {mode === 'register' && registerStep === 2 && (
          <form onSubmit={handleProfileSetupSubmit} className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-1">
              <button
                type="button"
                onClick={() => setRegisterStep(1)}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Account Info</span>
              </button>
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                Step 2 of 2 • Profile Onboarding
              </span>
            </div>

            {/* Profile Inputs Grid */}
            <div className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Full Name <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Valentin"
                    className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-medium"
                  />
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Email Address <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="valentinine14feb@gmail.com"
                    className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-mono"
                  />
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Phone Number <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-mono"
                  />
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Profile Picture Selection Section */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-medium text-zinc-300">
                    Profile Picture <span className="text-emerald-400">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">Upload photo or pick preset</span>
                </div>

                {/* Live Preview Header Card */}
                <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3.5 mb-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-700 shrink-0 shadow-md">
                    <img src={avatar} alt="Profile Preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-zinc-950" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{name || 'Your Name'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono truncate">{email || 'email@veluno.com'}</p>
                    {uploadedFileName && (
                      <span className="text-[9px] text-emerald-400 font-mono block mt-0.5 truncate">
                        Custom File: {uploadedFileName}
                      </span>
                    )}
                  </div>
                </div>

                {/* File Upload Dropzone */}
                <div className="relative mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="p-3 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-900 text-center transition-all flex items-center justify-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                    <Upload className="w-4 h-4 text-zinc-400" />
                    <span className="font-medium">Upload Custom Photo</span>
                    <span className="text-[10px] text-zinc-500 font-mono">(PNG, JPG, WebP)</span>
                  </div>
                </div>

                {/* Preset Avatar Gallery */}
                <div>
                  <span className="block text-[10px] text-zinc-400 font-mono mb-1.5">Or choose a studio preset:</span>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => {
                          setAvatar(preset.url);
                          setUploadedFileName(null);
                        }}
                        className={`w-full aspect-square rounded-full overflow-hidden border-2 transition-all active:scale-95 ${
                          avatar === preset.url 
                            ? 'border-white ring-2 ring-emerald-400/80 scale-105 shadow-md' 
                            : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Profile Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-[0.98] transition-all mt-5"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  Saving Profile & Launching Dashboard...
                </span>
              ) : (
                <>
                  <span>Complete Profile & Access Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Footer */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Trust Protocol</span>
          </div>
          <span>256-Bit TLS Encryption</span>
        </div>
      </div>
    </div>
  );
};
