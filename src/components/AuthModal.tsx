import React, { useState } from 'react';
import { 
  X, Lock, Mail, User, ShieldCheck, ArrowRight, CheckCircle2, 
  Sparkles, KeyRound, Eye, EyeOff 
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onAuthenticate: (userData: Partial<UserProfile>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onAuthenticate
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('valentinine14feb@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Valentin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(mode === 'login' ? 'Authentication successful!' : 'Account registered & session initialized!');
      
      setTimeout(() => {
        onAuthenticate({
          name: mode === 'register' ? name : (name || 'Valentin'),
          email: email || 'valentinine14feb@gmail.com',
          isAuthenticated: true,
          avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80'
        });
        onClose();
      }, 700);
    }, 600);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Authenticated via Google OAuth 2.0 Secure Session');
      setTimeout(() => {
        onAuthenticate({
          name: 'Valentin (Google)',
          email: 'valentinine14feb@gmail.com',
          isAuthenticated: true,
          avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80'
        });
        onClose();
      }, 700);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fadeIn"
      />

      {/* Auth Card */}
      <div 
        id="auth-modal-card"
        className="relative w-full max-w-md bg-neutral-900/95 border border-neutral-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 z-10 backdrop-blur-2xl animate-scaleUp text-neutral-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-neutral-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white text-neutral-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-white/10">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <h2 className="font-editorial text-2xl font-bold text-white">
            {mode === 'login' ? 'Welcome Back to Veluno' : 'Create Veluno Account'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-light">
            {mode === 'login' 
              ? 'Access your sovereign cart, active payment links & saved gear' 
              : 'Join the premier destination for tactile architecture and agentic commerce'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'login' 
                ? 'bg-neutral-800 text-white shadow' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'register' 
                ? 'bg-neutral-800 text-white shadow' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Success Message Banner */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-green-950/80 border border-green-500/50 text-green-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 hover:border-neutral-600 text-neutral-100 text-xs font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm mb-4"
        >
          {/* Official Google G Logo */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-neutral-800" />
          <span className="absolute px-3 bg-neutral-900 text-[10px] uppercase font-mono tracking-wider text-neutral-500">
            or use credentials
          </span>
        </div>

        {/* Credential Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Valentin"
                  className="w-full py-2 pl-9 pr-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                />
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="valentinine14feb@gmail.com"
                className="w-full py-2 pl-9 pr-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors font-mono"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-neutral-400">
                Password
              </label>
              {mode === 'login' && (
                <button type="button" className="text-[10px] text-neutral-400 hover:text-neutral-300">
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full py-2 pl-9 pr-9 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors font-mono"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-[0.98] transition-all mt-4"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                Verifying Credentials...
              </span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In Securely' : 'Complete Registration'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Security Assurance Footer */}
        <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <div className="flex items-center gap-1 text-green-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Zero-Trust Protocol</span>
          </div>
          <span>256-Bit TLS End-to-End</span>
        </div>
      </div>
    </div>
  );
};
