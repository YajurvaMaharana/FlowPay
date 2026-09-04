const fs = require('fs');
let code = fs.readFileSync('src/data/products.ts', 'utf8');

const newProducts = `,
  {
    id: 'prod_laptop_stand',
    name: 'ErgoElevate Aluminum Laptop Stand',
    tagline: 'Adjustable Ergonomic Riser for MacBooks and Laptops',
    category: 'workspace',
    price: 3499,
    originalPrice: 4999,
    currency: 'INR',
    rating: 4.8,
    reviewsCount: 654,
    inStock: true,
    stockCount: 89,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    description: 'Precision-machined from aerospace-grade aluminum. Dual-hinge design allows you to adjust both height and angle for the perfect ergonomic eye-level setup.',
    features: [
      'Dual-hinge height and angle adjustability',
      'Ventilated backplate prevents laptop thermal throttling',
      'Anti-slip silicone protective pads',
      'Folds flat for portability'
    ],
    specs: {
      'Material': 'Aviation Aluminum Alloy',
      'Max Load': '10kg',
      'Compatibility': '10" to 17" laptops',
      'Weight': '850g'
    },
    tags: ['stand', 'laptop', 'ergonomic', 'workspace', 'aluminum']
  },
  {
    id: 'prod_light_bar',
    name: 'Lumina ScreenBar Pro',
    tagline: 'Asymmetrical Desk Lamp for Eye Comfort',
    category: 'workspace',
    price: 4999,
    originalPrice: 5999,
    currency: 'INR',
    rating: 4.9,
    reviewsCount: 312,
    inStock: true,
    stockCount: 45,
    image: 'https://images.unsplash.com/photo-1588612502693-01bd0cb36a7e?w=800&auto=format&fit=crop&q=80',
    description: 'Asymmetrical optical design illuminates only your desk and keyboard, avoiding screen glare and reducing eye strain during long hours of work.',
    features: [
      'Zero screen glare optical design',
      'Auto-dimming ambient light sensor',
      'Adjustable color temperature (2700K - 6500K)',
      'Touch controls and USB-powered'
    ],
    specs: {
      'Illuminance': '1000 Lux',
      'Power': '5W (USB-C)',
      'Color Temp': '2700K - 6500K',
      'Mount': 'Weighted gravity clip'
    },
    tags: ['light', 'lamp', 'desk', 'workspace', 'ergonomic']
  }
];`;

code = code.replace("];", newProducts);
fs.writeFileSync('src/data/products.ts', code);
