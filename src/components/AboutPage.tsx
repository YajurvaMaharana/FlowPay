import React from 'react';
import { 
  ShieldCheck, Cpu, Sparkles, Key, CheckCircle2, ArrowRight, 
  Layers, Lock, Terminal, Globe, Award, HeartHandshake
} from 'lucide-react';

interface AboutPageProps {
  onOpenAgent: (query?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenAgent }) => {
  const pillars = [
    {
      number: '01',
      title: 'Architectural Materiality',
      subtitle: 'Solid CNC Titanium, FSC Walnut & Bit-Perfect Acoustics',
      description: 'We believe personal computing instruments should be as durable, resonant, and beautiful as bespoke horology or mid-century furniture. Every switch, driver, and chassis in our collection is stress-tested to studio mastering standards.',
      icon: <Layers className="w-6 h-6 text-neutral-400" />
    },
    {
      number: '02',
      title: 'Zero-Trust Agentic Commerce',
      subtitle: 'Deterministic Guardrails & Real-Time Threat Sanitization',
      description: 'AlphaCart is not a chatbot—it is an autonomous sales engineer operating within a strict Zero-Trust enclave. All direct prompt injections are intercepted, sensitive financial PII is scrubbed before processing, and concession algorithms are strictly capped at 10%.',
      icon: <ShieldCheck className="w-6 h-6 text-green-400" />
    },
    {
      number: '03',
      title: 'Human-in-the-Loop Sovereignty',
      subtitle: 'Gated Payment Links & Transparent Ledgering',
      description: 'Our AI agent cannot autonomously debit your account or alter invoice pricing without explicit human authorization. Every checkout creates an encrypted Razorpay payment link accompanied by an instant, immutable tax invoice.',
      icon: <Lock className="w-6 h-6 text-amber-400" />
    }
  ];

  const studios = [
    {
      city: 'Bengaluru',
      country: 'India',
      role: 'Global Logistics & Agentic Commerce Engine',
      address: 'Indiranagar 100ft Road, Sector 2',
      status: 'Active Node • 18% GST Compliant'
    },
    {
      city: 'Tokyo',
      country: 'Japan',
      role: 'Acoustic Engineering & Material Sanctum',
      address: 'Minato-ku, Aoyama 3-Chome',
      status: 'Acoustic Lab Active'
    },
    {
      city: 'San Francisco',
      country: 'United States',
      role: 'AI Model Alignment & Zero-Trust Kernel',
      address: 'Mission Bay Engineering Node',
      status: 'Kernel v3.8 Active'
    }
  ];

  return (
    <div id="about-page-view" className="w-full min-h-screen bg-neutral-950 text-neutral-100 py-10 px-4 sm:px-6 md:px-10 lg:px-16 animate-fadeIn">
      
      {/* Editorial Hero Statement */}
      <div className="max-w-4xl mx-auto text-center space-y-5 mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
          <span>The Veluno Manifesto • Vol. IV</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15]">
          Where Tactile Architecture Meets Agentic Commerce.
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 font-light leading-relaxed max-w-2xl mx-auto">
          Veluno curates enduring workspace instruments and studio acoustics, powered by an AI sales engineer governed by mathematical security bounds.
        </p>
      </div>

      {/* 3 Core Architecture Pillars */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {pillars.map((pillar) => (
          <div 
            key={pillar.number}
            className="p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800/90 backdrop-blur-2xl hover:border-neutral-700 transition-all flex flex-col justify-between space-y-6 shadow-2xl shadow-black/60 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {pillar.icon}
                </div>
                <span className="font-editorial text-2xl font-bold text-neutral-700 group-hover:text-neutral-500 transition-colors">
                  {pillar.number}
                </span>
              </div>

              <h2 className="font-editorial text-xl font-bold text-white group-hover:text-neutral-200 transition-colors">
                {pillar.title}
              </h2>
              <h3 className="text-xs font-mono text-neutral-400 font-semibold">
                {pillar.subtitle}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                {pillar.description}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center gap-2 text-[11px] font-mono text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Architecturally Enforced</span>
            </div>
          </div>
        ))}
      </div>

      {/* Security & Zero-Trust Protocol Deep Dive */}
      <div className="max-w-5xl mx-auto p-8 sm:p-12 rounded-3xl bg-neutral-900/80 border border-neutral-800/80 shadow-2xl shadow-black/80 backdrop-blur-2xl mb-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-950/80 border border-green-500/40 flex items-center justify-center text-green-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-white">AlphaCart Zero-Trust Engine</h2>
              <p className="text-xs text-neutral-400 font-mono">Formal security verification & bounded AI negotiation</p>
            </div>
          </div>

          <button
            onClick={() => onOpenAgent('Explain your Zero-Trust protocols, PII masking rules, and discount limitation algorithms.')}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-neutral-700"
          >
            <span>Audit Live Agent Kernel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono text-neutral-300">
          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
            <div className="text-neutral-400 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Bounded Concession Model</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Every promotional code and bundle negotiation is clamped at runtime by deterministic guardrails. Under no circumstances can prompt injection force a discount exceeding 10.0%.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
            <div className="text-green-400 font-bold flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>PII Minimization Pipeline</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Credit card primary account numbers (PAN), CVVs, and physical addresses are masked using Luhn validation heuristics prior to neural model ingestion.
            </p>
          </div>
        </div>
      </div>

      {/* Global Fabrication & Design Studios */}
      <div className="max-w-7xl mx-auto space-y-6 mb-20">
        <div className="text-center space-y-2">
          <h2 className="font-editorial text-3xl font-bold text-white">Global Nodes & Acoustic Labs</h2>
          <p className="text-xs text-neutral-400 font-mono">Precision manufacturing & low-latency inference clusters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {studios.map((studio) => (
            <div 
              key={studio.city}
              className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-lg font-bold text-white">
                  {studio.city}, <span className="text-neutral-400 font-light">{studio.country}</span>
                </h3>
                <Globe className="w-4 h-4 text-neutral-500" />
              </div>
              <p className="text-xs text-neutral-300 font-semibold">{studio.role}</p>
              <p className="text-[11px] text-neutral-400 font-mono">{studio.address}</p>
              <div className="pt-2 border-t border-neutral-800 text-[10px] font-mono text-green-400">
                {studio.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="max-w-3xl mx-auto text-center space-y-4 pt-8 border-t border-neutral-800">
        <h3 className="font-editorial text-2xl font-bold text-white">Ready to elevate your workspace?</h3>
        <p className="text-xs text-neutral-400 max-w-md mx-auto font-light">
          Ask AlphaCart to assemble a custom studio setup or browse our complete hardware catalog.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenAgent('Recommend the best acoustic setup for a quiet home office.')}
            className="px-6 py-3 rounded-full bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-neutral-600" />
            <span>Consult AI Concierge</span>
          </button>
        </div>
      </div>

    </div>
  );
};
