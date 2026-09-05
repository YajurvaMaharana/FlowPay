import React, { useState } from 'react';
import { 
  X, User, Mail, Phone, Upload, CheckCircle2, 
  Camera, Sparkles, UserCheck, Image as ImageIcon, Save
} from 'lucide-react';
import { UserProfile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onUpdateProfile: (updatedData: Partial<UserProfile>) => void;
}

export const PRESET_AVATARS = [
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

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdateProfile
}) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState(user.avatar || PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Custom Image File Upload
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

  const handleApplyCustomUrl = () => {
    if (customAvatarUrl.trim()) {
      setAvatar(customAvatarUrl.trim());
      setUploadedFileName('External URL');
      setCustomAvatarUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      onUpdateProfile({
        name: name.trim() || user.name,
        email: email.trim() || user.email,
        phone: phone.trim() || user.phone,
        avatar: avatar || user.avatar
      });

      setIsLoading(false);
      setSavedSuccess(true);

      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn"
      />

      {/* Edit Profile Modal Card */}
      <div 
        id="edit-profile-modal-card"
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/95 z-10 backdrop-blur-2xl animate-scaleUp text-zinc-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-zinc-800/80">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-editorial text-2xl font-bold text-white tracking-tight">
              Edit User Profile
            </h2>
            <p className="text-xs text-zinc-400 font-light">
              Update your personal details, contact number, and profile avatar
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {savedSuccess && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">Profile successfully updated across your active session!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Live Profile Header Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-700 shrink-0 shadow-md">
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-zinc-950" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white truncate">{name || 'User'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <p className="text-xs text-zinc-400 font-mono truncate">{email || 'no-email@veluno.com'}</p>
              <p className="text-[11px] text-zinc-500 font-mono truncate mt-0.5">{phone || 'No phone set'}</p>
            </div>
          </div>

          {/* Full Name Input */}
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

          {/* Email Input */}
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

          {/* Phone Input */}
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

          {/* Profile Picture Section */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-zinc-300">
                Profile Picture Avatar
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">Upload photo or select avatar</span>
            </div>

            {/* Custom Image Upload */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="p-3 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-900 text-center transition-all flex items-center justify-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                <Upload className="w-4 h-4 text-zinc-400" />
                <span className="font-medium">Upload Custom Photo</span>
                {uploadedFileName && (
                  <span className="text-[10px] text-emerald-400 font-mono">({uploadedFileName})</span>
                )}
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

          {/* Action Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors border border-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
