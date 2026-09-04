import React, { useState } from 'react';
import { 
  X, Settings, ShieldCheck, User, Mail, MapPin, EyeOff, 
  CheckCircle2, Bell, Lock, Cpu, Sparkles 
} from 'lucide-react';
import { UserProfile } from '../types';

interface AccountSettingsModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (updatedData: Partial<UserProfile>) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdateUser
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [street, setStreet] = useState(user.address?.street || '42 Indiranagar 100ft Road');
  const [city, setCity] = useState(user.address?.city || 'Bengaluru');
  const [state, setState] = useState(user.address?.state || 'Karnataka');
  const [pincode, setPincode] = useState(user.address?.pincode || '560038');
  const [country, setCountry] = useState(user.address?.country || 'India');
  const [strictPii, setStrictPii] = useState(user.preferences?.piiStrictMasking ?? true);
  const [autoMaxDiscount, setAutoMaxDiscount] = useState(user.preferences?.autoApplyMaxDiscount ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      email,
      address: {
        street,
        city,
        state,
        pincode,
        country
      },
      preferences: {
        piiStrictMasking: strictPii,
        autoApplyMaxDiscount: autoMaxDiscount,
        currency: 'INR'
      }
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fadeIn"
      />

      {/* Settings Modal Card */}
      <div 
        id="account-settings-modal-card"
        className="relative w-full max-w-xl bg-neutral-900/95 border border-neutral-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 z-10 backdrop-blur-2xl animate-scaleUp text-neutral-100 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-white">Account & Zero-Trust Settings</h2>
              <p className="text-xs text-neutral-400 font-mono">
                Manage profile identity, shipping address & privacy protocols
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 text-xs">
          
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-green-950/80 border border-green-500/50 text-green-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Settings updated & cryptographic session re-keyed!</span>
            </div>
          )}

          {/* Section 1: Personal Info */}
          <div className="space-y-3">
            <h3 className="font-editorial font-bold text-xs uppercase tracking-wider text-neutral-400">
              Profile Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Email (PII Protected)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Default Delivery Address */}
          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <h3 className="font-editorial font-bold text-xs uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>Shipping & Delivery Destination</span>
            </h3>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: AI & Zero-Trust Protocol Preferences */}
          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <h3 className="font-editorial font-bold text-xs uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              <span>AI Security & Privacy Protocols</span>
            </h3>

            {/* Strict PII Masking Toggle */}
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <EyeOff className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Strict Real-time PII Scrubbing</div>
                  <p className="text-[10px] text-neutral-400 leading-normal">
                    Automatically redact credit card numbers and physical addresses before sending to the model context.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={strictPii}
                onChange={(e) => setStrictPii(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-600 focus:ring-neutral-500 bg-neutral-900 border-neutral-700 cursor-pointer"
              />
            </div>

            {/* Auto Discount Negotiation Toggle */}
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Auto-Request Maximum Concession (≤10%)</div>
                  <p className="text-[10px] text-neutral-400 leading-normal">
                    Instruct Veluno Concierge to always apply the maximum authorized 10% discount on multi-item bundles.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoMaxDiscount}
                onChange={(e) => setAutoMaxDiscount(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-600 focus:ring-neutral-500 bg-neutral-900 border-neutral-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold transition-all shadow-md active:scale-95"
            >
              Save Preferences
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
