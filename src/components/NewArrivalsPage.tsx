import React, { useRef, useState } from 'react';
import { 
  ArrowLeft, ArrowRight, Sparkles, ShieldCheck, ShoppingBag, 
  Heart, Star, Zap, Layers, Award, CheckCircle2, ChevronRight,
  Flame, Gauge
} from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';

interface NewArrivalsPageProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleSave: (productId: string) => void;
  savedGearIds: string[];
  onOpenAgent: (query?: string) => void;
}

export const NewArrivalsPage: React.FC<NewArrivalsPageProps> = ({
  onSelectProduct,
  onAddToCart,
  onToggleSave,
  savedGearIds,
  onOpenAgent
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);

  // Curated flagship items for New Arrivals & Limited Edition series
  const flagshipArrivals = [
    {
      product: PRODUCTS[0], // Apex Acoustic ANC Pro
      editionTag: 'Batch 01 • Limited Run (50 Units)',
      accentColor: 'indigo',
      award: 'Red Dot Best of Studio Acoustics 2026',
      acousticCurve: 'Harman Reference 2026 Target • 48dB Hybrid Active ANC',
      machining: 'CNC Aerospace Grade 5 Titanium & Memory Foam Alcantara'
    },
    {
      product: PRODUCTS[4], // AeroType Carbon Mechanical
      editionTag: 'Limited Carbon Weave Edition',
      accentColor: 'amber',
      award: 'Master Mechanical Keyboard of the Year',
      acousticCurve: 'Dual Silicone Gasket • Factory Lubricated Gateron Oil Kings',
      machining: 'Hand-Forged 3K Carbon Fiber Plate & Anodized Gunmetal Frame'
    },
    {
      product: PRODUCTS[1], // SoundWave Hi-Fi DAC
      editionTag: 'Flagship Bit-Perfect Master Series',
      accentColor: 'emerald',
      award: 'Japan VGP Hi-Res Grand Prix Award',
      acousticCurve: 'Dual ESS Sabre ES9038Q2M • 0.00008% THD+N',
      machining: 'Milled Monolithic Solid Copper Block with Gold Terminals'
    },
    {
      product: PRODUCTS[7], // Lumina Curve 34" Monitor
      editionTag: 'Cinematic Studio Reference 2026',
      accentColor: 'cyan',
      award: 'Colorist Society Master Display Certified',
      acousticCurve: '1000R Panoramic 165Hz Fast-IPS • 98% DCI-P3 ΔE<1',
      machining: 'Zero-Bezel Magnesium Alloy Enclosure with 90W USB-C PD'
    },
    {
      product: PRODUCTS[3], // ErgoLift Carbon Desk
      editionTag: 'Custom Workspace Masterwork',
      accentColor: 'purple',
      award: 'Ergonomic Excellence Gold Standard',
      acousticCurve: 'Dual Whisper Motors (<40dB) • Smart Gyro Anti-Collision',
      machining: 'Solid FSC European Walnut with Integrated Wireless Qi Mat'
    }
  ];

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 420;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div id="new-arrivals-page-view" className="w-full min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 sm:px-6 md:px-10 lg:px-12 animate-fadeIn">
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-[11px] font-mono text-amber-300 mb-2">
              <Flame className="w-3.5 h-3.5" />
              <span>Autumn 2026 Release • Limited Production Batches</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              New Arrivals & Flagship Drops
            </h1>
            <p className="text-sm text-neutral-400 max-w-xl font-light mt-1">
              Hand-numbered limited series, experimental acoustic engineering, and zero-compromise tactile instruments.
            </p>
          </div>

          {/* Carousel Scroll Controls */}
          <div className="flex items-center gap-3">
            <button
              id="new-arrivals-prev-btn"
              onClick={() => scrollCarousel('left')}
              className="w-11 h-11 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
              title="Previous Drop"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              id="new-arrivals-next-btn"
              onClick={() => scrollCarousel('right')}
              className="w-11 h-11 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 flex items-center justify-center transition-all shadow-lg active:scale-95 font-bold"
              title="Next Drop"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Flagship Showcase Carousel */}
      <div className="max-w-7xl mx-auto mb-14">
        <div 
          ref={carouselRef}
          className="flex items-stretch gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {flagshipArrivals.map((item, idx) => {
            const prod = item.product;
            const isSaved = savedGearIds.includes(prod.id);

            return (
              <div
                key={prod.id}
                className="w-[85vw] sm:w-[420px] md:w-[460px] shrink-0 snap-center rounded-3xl bg-neutral-900/80 border border-neutral-700/80 hover:border-neutral-600 transition-all p-6 flex flex-col justify-between backdrop-blur-2xl shadow-2xl shadow-black/80 group"
              >
                {/* Top Badge & Number */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.editionTag}</span>
                  </div>
                  <span className="font-editorial text-xl font-bold text-neutral-600 group-hover:text-neutral-400 transition-colors">
                    0{idx + 1}
                  </span>
                </div>

                {/* Hero Showcase Image */}
                <div 
                  onClick={() => onSelectProduct(prod)}
                  className="relative w-full h-64 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 cursor-pointer mb-5"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                  
                  {/* Saved Heart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(prod.id);
                    }}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${
                      isSaved 
                        ? 'bg-red-600 text-white shadow-md' 
                        : 'bg-neutral-900/80 text-neutral-300 hover:text-white border border-neutral-700'
                    }`}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 text-[11px] font-mono text-neutral-300 bg-neutral-950/80 backdrop-blur-md p-2 rounded-xl border border-neutral-800/80 flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{item.acousticCurve}</span>
                  </div>
                </div>

                {/* Information Specs */}
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[11px] text-amber-400 font-semibold">{item.award}</span>
                      <div className="flex items-center gap-1 text-amber-400 font-mono text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{prod.rating}</span>
                      </div>
                    </div>

                    <h3 
                      onClick={() => onSelectProduct(prod)}
                      className="font-editorial text-xl font-bold text-white group-hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                      {prod.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  {/* Machining & Materiality details */}
                  <div className="p-3 rounded-xl bg-neutral-950/90 border border-neutral-800 text-[11px] font-mono text-neutral-400 space-y-1">
                    <div className="text-neutral-300 font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Materiality:</span>
                    </div>
                    <p className="text-neutral-400 leading-normal">{item.machining}</p>
                  </div>

                  {/* Pricing & CTA Controls */}
                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-lg font-bold text-white">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-green-400 font-mono">
                        GST 18% & Global Air Freight Included
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenAgent(`I would like to acquire the limited release ${prod.name}. Can you explain its engineering specs and verify stock reservation?`)}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-700"
                        title="Chat to Buy"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Chat to Buy</span>
                      </button>

                      <button
                        onClick={() => onAddToCart(prod)}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Flagship Production Commitment Banner */}
      <div className="max-w-7xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/90 border border-neutral-800 text-neutral-300 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
        <div className="space-y-2">
          <h3 className="font-editorial text-2xl font-bold text-white">
            Custom Machined Hardware Inquiries
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl font-light">
            Need bespoke finishes, custom switch lubricants, or multi-seat corporate studio deployments? Veluno Concierge Concierge can coordinate directly with our Bangalore and Tokyo fabrication workshops.
          </p>
        </div>
        <button
          onClick={() => onOpenAgent('I would like to discuss a custom machined gear commission for our studio.')}
          className="px-6 py-3 rounded-full bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-all shadow-lg active:scale-95 shrink-0 flex items-center gap-2"
        >
          <span>Initiate Custom Commission</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
