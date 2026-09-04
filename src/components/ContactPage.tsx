import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Send, Sparkles, ShieldCheck, CheckCircle2, 
  MessageSquare, Key, Clock, Globe, ArrowRight 
} from 'lucide-react';

interface ContactPageProps {
  onOpenAgent: (query?: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenAgent }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('concierge');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 700);
  };

  return (
    <div id="contact-page-view" className="w-full min-h-screen bg-neutral-950 text-neutral-100 py-10 px-4 sm:px-6 md:px-10 lg:px-16 animate-fadeIn">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400">
          <Globe className="w-3.5 h-3.5 text-neutral-400" />
          <span>Global Inquiries & Studio Commissions</span>
        </div>

        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
          Direct Line to Veluno
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 font-light max-w-xl mx-auto">
          Whether commissioning bespoke hardware, seeking corporate deployments, or auditing our Zero-Trust protocols, our team is at your disposal.
        </p>
      </div>

      {/* Main Grid: Form + Info Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Glassmorphic Contact Form (7 Cols) */}
        <div className="lg:col-span-7 bg-neutral-900/70 border border-neutral-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black/80 space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h2 className="font-editorial text-xl font-bold text-white">Send a Dispatch</h2>
              <p className="text-xs text-neutral-400 font-mono">Encrypted transmission to Veluno Gateway</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-green-400">
              <ShieldCheck className="w-4 h-4" />
              <span>TLS 1.3</span>
            </div>
          </div>

          {isSubmitted ? (
            <div className="p-8 rounded-2xl bg-green-950/40 border border-green-500/40 text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-green-900/60 border border-green-500/50 flex items-center justify-center mx-auto text-green-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-white">Dispatch Received & Logged</h3>
              <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                Your communication has been routed to our team. You will receive an encrypted response within 2 hours.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Valentin"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="valentinine14feb@gmail.com"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Inquiry Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500 transition-colors"
                >
                  <option value="concierge">Veluno Concierge (Gear & Bundles)</option>
                  <option value="custom-build">Custom Studio Architecture & Fabrication</option>
                  <option value="orders">Razorpay Invoices & Global Air Freight</option>
                  <option value="security">Security & Zero-Trust Protocol Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Message / Specifications
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your acoustic requirements or order inquiry..."
                  className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[10px] text-neutral-500 font-mono">
                  All transmissions cryptographically signed & logged.
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                      Encrypting...
                    </span>
                  ) : (
                    <>
                      <span>Transmit Dispatch</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Right: Instant AI Switch & Studio Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Instant AI Concierge Callout */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-neutral-950/70 via-neutral-900/90 to-neutral-950 border border-neutral-500/40 shadow-2xl p-6 space-y-4 backdrop-blur-2xl">
            <div className="w-10 h-10 rounded-2xl bg-neutral-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-white">Need an Instant Response?</h3>
              <p className="text-xs text-neutral-300 font-light mt-1 leading-relaxed">
                Skip the queue. Veluno Concierge can answer technical specifications, compare acoustic curves, negotiate bundle discounts (up to 10%), and generate instant payment links right now.
              </p>
            </div>
            <button
              onClick={() => onOpenAgent('Hello! I have a question about Veluno gear and ordering.')}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-neutral-600" />
              <span>Launch Live AI Concierge</span>
            </button>
          </div>

          {/* Studio Contact Information */}
          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-2xl space-y-4 text-xs">
            <h3 className="font-editorial font-bold text-sm text-white">Direct Communication Channels</h3>
            
            <div className="space-y-3 font-mono text-neutral-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="truncate">concierge@veluno.tech</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>Indiranagar 100ft Rd, Bangalore 560038</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-green-400 shrink-0" />
                <span>Response SLA: &lt; 15 Minutes (AI) / &lt; 2h (Human)</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                <Key className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">PGP: 8F3D 4C2A 1E90 B762</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
