import React from 'react';

interface TactileMonogramLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export const TactileMonogramIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Matte Graphite & Dark Titanium Metallic Gradients */}
      <linearGradient id="titanium-top-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="45%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>

      <linearGradient id="titanium-mid-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      <linearGradient id="titanium-dark-base" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>

    {/* Layer 1: Base Dark Titanium Structural V Frame (Keycap Bottom Base) */}
    <path
      d="M 3.5 4.5 L 16 27.5 L 28.5 4.5 L 22.5 4.5 L 16 18 L 9.5 4.5 Z"
      fill="url(#titanium-dark-base)"
    />

    {/* Layer 2: Mid Stacked Keycap Profile (Stacked Metallic Plate) */}
    <path
      d="M 6.2 5.8 L 16 25 L 25.8 5.8 L 21 5.8 L 16 15.8 L 11 5.8 Z"
      fill="url(#titanium-mid-body)"
    />

    {/* Layer 3: Top Angular Tactile Keycap Chamfer (Brushed High-Tech Highlight) */}
    <path
      d="M 8.8 7 L 16 21.2 L 23.2 7 L 19.5 7 L 16 13.5 L 12.5 7 Z"
      fill="url(#titanium-top-highlight)"
    />

    {/* Tactile Keycap Stepped Ridge Accents (Top side profile bevels) */}
    <polygon points="3.5,4.5 6.2,5.8 11,5.8 9.5,4.5" fill="#ffffff" opacity="0.4" />
    <polygon points="28.5,4.5 25.8,5.8 21,5.8 22.5,4.5" fill="#cbd5e1" opacity="0.3" />

    {/* Center Core Switch Stem (Tactile Hardware Precision Accent) */}
    <rect x="15.1" y="6.8" width="1.8" height="3.8" rx="0.4" fill="#ffffff" opacity="0.9" />
  </svg>
);

export const TactileMonogramLogo: React.FC<TactileMonogramLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText = 'AI Commerce',
  className = '',
  onClick,
  id = 'veluno-monogram-brand'
}) => {
  const iconDimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-10 h-10 sm:w-11 sm:h-11'
  }[size];

  const titleSize = {
    sm: 'text-sm',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl'
  }[size];

  return (
    <div 
      id={id}
      onClick={onClick} 
      className={`flex items-center gap-3 text-white group text-left transition-transform active:scale-95 cursor-pointer ${className}`}
    >
      {/* Bare Isolated Monogram Icon (Container-Less) */}
      <TactileMonogramIcon className={`${iconDimensions} group-hover:scale-105 transition-transform duration-300 shrink-0 drop-shadow-sm`} />

      <div className="flex flex-col">
        <span className={`font-editorial ${titleSize} font-bold tracking-tight text-white group-hover:text-neutral-200 transition-colors`}>
          Veluno
        </span>
        {showSubtitle && (
          <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono -mt-0.5">
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};
