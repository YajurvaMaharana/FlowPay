import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'prod_apex_anc',
    name: 'Apex Acoustic ANC Pro Wireless',
    tagline: 'Flagship 48dB Hybrid Noise-Cancelling Studio Headphones',
    category: 'audio',
    price: 14999,
    originalPrice: 19999,
    currency: 'INR',
    rating: 4.9,
    reviewsCount: 1420,
    inStock: true,
    stockCount: 38,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    description: 'Custom 40mm Beryllium acoustic drivers delivering ultra-low distortion audiophile sound, spatial audio head tracking, and up to 60 hours of continuous playback.',
    features: [
      'Active Hybrid ANC up to 48dB depth',
      'Lossless LDAC & aptX HD Bluetooth 5.4',
      '60-hour ultra-fast charging battery (10 min = 5 hrs)',
      'Plush memory foam lambskin earcups'
    ],
    specs: {
      'Driver Size': '40mm Beryllium Dome',
      'Frequency Response': '5Hz - 45,000Hz',
      'Battery Life': '60h (ANC off) / 45h (ANC on)',
      'Weight': '250g',
      'Connectivity': 'Bluetooth 5.4, 3.5mm AUX, USB-C Lossless Audio'
    },
    crossSellProductId: 'prod_soundwave_dac',
    crossSellReason: 'Pair with the SoundWave 32-bit USB-C Lossless DAC for true bit-perfect Master Quality audio playback.',
    crossSellDiscount: 10,
    badge: 'Bestseller',
    tags: ['headphones', 'anc', 'wireless', 'audio', 'music', 'studio', 'overear', 'apex']
  },
  {
    id: 'prod_soundwave_dac',
    name: 'SoundWave Hi-Fi 32-Bit USB-C DAC',
    tagline: 'Ultra-Compact Dual ESS Sabre Master Audio Amplifier',
    category: 'audio',
    price: 3499,
    originalPrice: 4499,
    currency: 'INR',
    rating: 4.8,
    reviewsCount: 680,
    inStock: true,
    stockCount: 54,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    description: 'Aircraft-grade CNC aluminum Hi-Res DAC delivering 32-bit/384kHz and DSD256 decoding for phones, laptops, and studio setups.',
    features: [
      'Dual ESS ES9281AC Pro flagship chips',
      'Direct DSD256 & MQA Hardware unfolding',
      'Zero background hiss with ultra-low impedance output',
      'Universal USB-C / Lightning plug & play'
    ],
    specs: {
      'SNR': '128dB',
      'THD+N': '0.0003%',
      'Output Power': '240mW @ 32Ω',
      'Weight': '18g',
      'Chassis': 'Matte Anodized Aluminum'
    },
    crossSellProductId: 'prod_apex_anc',
    crossSellReason: 'Maximize output headroom with the Apex Acoustic ANC Pro.',
    crossSellDiscount: 10,
    badge: 'Audiophile Choice',
    tags: ['dac', 'amp', 'audio', 'soundwave', 'hifi', 'usbc', 'audiophile']
  },
  {
    id: 'prod_pulse_watch',
    name: 'PulseWatch Ultra Sapphire GPS',
    tagline: 'Titanium Smartwatch with Dual-Frequency Multi-Band GPS',
    category: 'wearables',
    price: 22999,
    originalPrice: 27999,
    currency: 'INR',
    rating: 4.9,
    reviewsCount: 980,
    inStock: true,
    stockCount: 19,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    description: 'Aerospace Grade 5 titanium case, scratch-resistant sapphire crystal display, 100m water resistance, and ECG cardiac sensor with 14-day battery life.',
    features: [
      'Dual-Band L1/L5 Precision Satellite GPS',
      'Medical-grade ECG and SpO2 biometric sensors',
      '14-day ultra endurance battery life',
      '100m dive-certified WR100 casing'
    ],
    specs: {
      'Case': '49mm Grade 5 Titanium',
      'Display': '1.43" AMOLED (1000 nits, Always-On)',
      'Water Rating': '10 ATM (100 meters)',
      'Sensors': 'Optical HR, ECG, SpO2, Skin Temp, Barometer',
      'Battery': '500mAh (14 days typical)'
    },
    crossSellProductId: 'prod_nomad_strap',
    crossSellReason: 'Add the Nomad Milanese Titanium Band for instant formal boardroom elegance.',
    crossSellDiscount: 10,
    badge: 'Popular',
    tags: ['smartwatch', 'watch', 'gps', 'fitness', 'titanium', 'wearables', 'pulsewatch']
  },
  {
    id: 'prod_nomad_strap',
    name: 'Nomad Titanium Milanese Loop Band',
    tagline: 'Custom Magnetic Mesh Band for Smartwatches',
    category: 'accessories',
    price: 2999,
    originalPrice: 3999,
    currency: 'INR',
    rating: 4.7,
    reviewsCount: 310,
    inStock: true,
    stockCount: 75,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
    description: 'Woven Grade 2 titanium wire mesh with high-strength neodymium magnetic clasp that fits wrists seamlessly with micro-adjustability.',
    features: [
      'Diamond-Like Carbon (DLC) scratch-resistant coating',
      'Dual-lock rare-earth magnetic security clasp',
      'Ultra-breathable sweat-resistant weave',
      'Universal quick-release pin connectors'
    ],
    specs: {
      'Material': 'Grade 2 Titanium Wire Mesh',
      'Lug Width': '22mm / 49mm compatible',
      'Wrist Fit': '140mm - 220mm',
      'Weight': '38g'
    },
    crossSellProductId: 'prod_pulse_watch',
    crossSellReason: 'Complete the luxury titanium look for your PulseWatch Ultra.',
    crossSellDiscount: 10,
    tags: ['strap', 'band', 'accessories', 'titanium', 'milanese', 'watch']
  },
  {
    id: 'prod_keychron_mech',
    name: 'AeroType Carbon Mechanical Keyboard',
    tagline: 'Custom 75% Gasket Mount Wireless Keyboard with Hot-Swap switches',
    category: 'computing',
    price: 8999,
    originalPrice: 11999,
    currency: 'INR',
    rating: 4.9,
    reviewsCount: 1120,
    inStock: true,
    stockCount: 26,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    description: 'Custom tuned pre-lubed Gateron Oil King linear switches, IXPE switch pads, acoustic silicone dampening, and South-Facing per-key RGB lighting.',
    features: [
      'Gasket Mount structure with multi-layer acoustic dampening',
      'Tri-Mode: 2.4GHz Low Latency (1ms), Bluetooth 5.2, USB-C',
      'Double-shot PBT Cherry profile keycaps',
      'CNC Aluminum top bezel with programmable volume knob'
    ],
    specs: {
      'Layout': '75% (84 Keys)',
      'Switches': 'Hot-Swappable 5-Pin Gateron Oil King Linear',
      'Battery': '4000mAh (Up to 300 hours)',
      'Weight': '1120g solid chassis'
    },
    crossSellProductId: 'prod_coiled_cable',
    crossSellReason: 'Add the Aviator Custom Coiled Braided Cable to elevate your desk aesthetic.',
    crossSellDiscount: 10,
    badge: 'Editor Choice',
    tags: ['keyboard', 'mechanical', 'custom', 'workspace', 'aerotype', 'computing', 'gasket']
  },
  {
    id: 'prod_coiled_cable',
    name: 'Vanguard Custom Aviator Coiled Cable',
    tagline: 'Heavy-Duty GX12 4-Pin Metal Aviator USB-C Cable',
    category: 'accessories',
    price: 1499,
    originalPrice: 1999,
    currency: 'INR',
    rating: 4.8,
    reviewsCount: 430,
    inStock: true,
    stockCount: 110,
    image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80',
    description: 'Double-sleeved braided cable with Techflex outer layer, tight reverse-wound coils, and quick-disconnect matte black GX12 aviator connector.',
    features: [
      'Tight 15cm reverse wound aesthetic coil',
      'Heavyweight GX12 zinc-alloy aviator connector',
      'Fast charging & high speed 480Mbps data transfer',
      'Gold-plated Type-C to Type-A / Type-C heads'
    ],
    specs: {
      'Total Length': '1.5m (Coiled section 15cm)',
      'Inner Jacket': 'PET Braided core',
      'Outer Sleeve': 'Techflex Flexo PET'
    },
    crossSellProductId: 'prod_keychron_mech',
    crossSellReason: 'Matches perfectly with the AeroType mechanical keyboard.',
    crossSellDiscount: 10,
    tags: ['cable', 'coiled', 'aviator', 'accessories', 'keyboard', 'usbc']
  },
  {
    id: 'prod_deskmat_pro',
    name: 'DeskMat Pro Armor Topographic 4mm',
    tagline: 'Extended XXL Micro-Woven Gaming & Desk Pad (900x400mm)',
    category: 'workspace',
    price: 1899,
    originalPrice: 2499,
    currency: 'INR',
    rating: 4.9,
    reviewsCount: 890,
    inStock: true,
    stockCount: 62,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    description: 'Spill-resistant nano-coated micro-textured cloth with 360° precision stitched anti-fray borders and non-slip natural herringbone rubber base.',
    features: [
      'Hydrophobic spill-resistant surface',
      '4mm thick plush cushioning for wrist support',
      'Laser-sharp white & gold topographic contour lines',
      'Precision anti-fray stitched perimeter'
    ],
    specs: {
      'Dimensions': '900mm x 400mm x 4mm',
      'Base': 'Natural textured eco-rubber',
      'Surface': 'High-density micro-woven cloth'
    },
    crossSellProductId: 'prod_keychron_mech',
    crossSellReason: 'Dampens mechanical keyboard vibrations and centers your desk setup.',
    crossSellDiscount: 10,
    tags: ['deskmat', 'mousepad', 'workspace', 'deskpad', 'setup', 'minimalist']
  },
  {
    id: 'prod_lumina_monitor',
    name: 'Lumina Curve 34" WQHD 165Hz Studio Monitor',
    tagline: '1000R Curved IPS Quantum Dot Display with 90W USB-C PD',
    category: 'computing',
    price: 38999,
    originalPrice: 46999,
    currency: 'INR',
    rating: 4.9,
    reviewsCount: 490,
    inStock: true,
    stockCount: 14,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    description: 'Ultrawide 21:9 WQHD 3440x1440 resolution, 98% DCI-P3 color gamut, factory color calibrated Delta E < 1.5, and single-cable 90W USB-C docking.',
    features: [
      '34-inch 1000R immersive curved panel',
      '98% DCI-P3 / 100% sRGB Color Accuracy',
      'Single USB-C cable for 90W charging, display & 4-port USB Hub',
      'Integrated KVM Switch for multiple laptops'
    ],
    specs: {
      'Resolution': '3440 x 1440 (WQHD 21:9)',
      'Refresh Rate': '165Hz with AMD FreeSync Premium',
      'Brightness': '450 nits HDR400',
      'Ports': '1x USB-C (90W PD), 2x HDMI 2.1, 1x DP 1.4, 4x USB-A'
    },
    crossSellProductId: 'prod_deskmat_pro',
    crossSellReason: 'Pair with the DeskMat Pro Armor XXL to anchor your ultrawide workspace.',
    crossSellDiscount: 10,
    badge: 'Flagship Display',
    tags: ['monitor', 'ultrawide', 'display', 'screen', 'lumina', 'computing', 'workspace']
  }
];
