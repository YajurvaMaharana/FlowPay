import { Product } from '../types';
import { PRODUCTS } from './products';

export interface EcosystemRule {
  coreCategory: 'mechanical_keyboard' | 'laptop' | 'audio' | 'smartwatch';
  categoryLabel: string;
  matcher: (product: Product) => boolean;
  compatibleAccessoryIds: string[];
  compatibleAccessoryKeywords: string[];
  contextTags: string[];
  recommendationTemplate: (coreProductName: string, primaryAccessoryName: string) => string;
}

/**
 * Ecosystem Compatibility Rules Object
 * Maps core products to ecosystem accessories
 */
export const ECOSYSTEM_COMPATIBILITY_RULES: EcosystemRule[] = [
  {
    coreCategory: 'mechanical_keyboard',
    categoryLabel: 'Mechanical Keyboard Ecosystem',
    matcher: (p: Product) => 
      p.id === 'prod_keychron_mech' || 
      p.name.toLowerCase().includes('keyboard') || 
      p.tags.includes('keyboard') || 
      p.tags.includes('mechanical') ||
      p.tags.includes('aerotype'),
    compatibleAccessoryIds: ['prod_artisan_keycaps', 'prod_coiled_cable', 'prod_deskmat_pro'],
    compatibleAccessoryKeywords: ['custom artisan keycaps', 'coiled aviation cables', 'desk mats'],
    contextTags: ['artisan_keycaps', 'coiled_aviator_cable', 'desk_mat', 'keyboard_accessories'],
    recommendationTemplate: (coreProductName: string, primaryAccessoryName: string) =>
      `Since you picked up the ${coreProductName} earlier, would you like to pair it with our ${primaryAccessoryName}?`
  },
  {
    coreCategory: 'laptop',
    categoryLabel: 'Portable Workstation & Laptop Ecosystem',
    matcher: (p: Product) => 
      p.id === 'prod_apexbook_pro16' || 
      p.id === 'prod_novacore_ultra' || 
      p.tags.includes('laptop') || 
      p.tags.includes('notebook') || 
      p.tags.includes('ultrabook') ||
      p.name.toLowerCase().includes('laptop') || 
      p.name.toLowerCase().includes('apexbook') ||
      p.name.toLowerCase().includes('novacore'),
    compatibleAccessoryIds: ['prod_laptop_sleeve', 'prod_usbc_dock', 'prod_vertical_stand', 'prod_laptop_stand'],
    compatibleAccessoryKeywords: ['compatible sleeves', 'USB-C docks', 'vertical stands'],
    contextTags: ['laptop_sleeve', 'usbc_thunderbolt_dock', 'vertical_stand', 'ergonomic_riser'],
    recommendationTemplate: (coreProductName: string, primaryAccessoryName: string) =>
      `Since you picked up the ${coreProductName} workstation earlier, pairing it with our ${primaryAccessoryName} completes your workstation setup.`
  },
  {
    coreCategory: 'audio',
    categoryLabel: 'Audiophile Sound Ecosystem',
    matcher: (p: Product) => 
      p.id === 'prod_apex_anc' || 
      p.tags.includes('headphones') || 
      p.tags.includes('anc'),
    compatibleAccessoryIds: ['prod_soundwave_dac'],
    compatibleAccessoryKeywords: ['Hi-Fi 32-bit USB-C Lossless DAC'],
    contextTags: ['audiophile_dac', 'hifi_amplifier', 'audio_accessories'],
    recommendationTemplate: (coreProductName: string, primaryAccessoryName: string) =>
      `Since you picked up the ${coreProductName} studio headphones earlier, would you like to pair them with our ${primaryAccessoryName} for bit-perfect audio?`
  },
  {
    coreCategory: 'smartwatch',
    categoryLabel: 'Wearable Tech Ecosystem',
    matcher: (p: Product) => 
      p.id === 'prod_pulse_watch' || 
      p.tags.includes('smartwatch') || 
      p.tags.includes('wearables'),
    compatibleAccessoryIds: ['prod_nomad_strap'],
    compatibleAccessoryKeywords: ['Titanium Milanese Loop Band'],
    contextTags: ['titanium_milanese_band', 'watch_accessories'],
    recommendationTemplate: (coreProductName: string, primaryAccessoryName: string) =>
      `Since you picked up the ${coreProductName} earlier, would you like to pair it with our ${primaryAccessoryName}?`
  }
];

export interface TaggedEcosystemContext {
  purchasedCoreProducts: Product[];
  activeRules: EcosystemRule[];
  contextTags: string[];
  compatibleAccessories: Product[];
  recommendationSnippets: string[];
  primaryOrganicPrompt: string;
}

/**
 * Evaluates session purchased items and tags the session context with compatible accessories
 */
export function evaluateEcosystemContext(purchasedItems: Product[]): TaggedEcosystemContext {
  if (!purchasedItems || purchasedItems.length === 0) {
    return {
      purchasedCoreProducts: [],
      activeRules: [],
      contextTags: [],
      compatibleAccessories: [],
      recommendationSnippets: [],
      primaryOrganicPrompt: ''
    };
  }

  const matchedCoreProducts: Product[] = [];
  const activeRules: EcosystemRule[] = [];
  const contextTagsSet = new Set<string>();
  const accessoryIdsSet = new Set<string>();
  const snippets: string[] = [];

  for (const item of purchasedItems) {
    for (const rule of ECOSYSTEM_COMPATIBILITY_RULES) {
      if (rule.matcher(item)) {
        matchedCoreProducts.push(item);
        if (!activeRules.some(r => r.coreCategory === rule.coreCategory)) {
          activeRules.push(rule);
        }
        rule.contextTags.forEach(t => contextTagsSet.add(t));
        rule.compatibleAccessoryIds.forEach(id => accessoryIdsSet.add(id));

        const accessoryProducts = PRODUCTS.filter(p => rule.compatibleAccessoryIds.includes(p.id));
        const leadAccName = accessoryProducts[0]?.name || rule.compatibleAccessoryKeywords[0];
        snippets.push(rule.recommendationTemplate(item.name, leadAccName));
        break;
      }
    }
  }

  const compatibleAccessories = PRODUCTS.filter(p => accessoryIdsSet.has(p.id));

  return {
    purchasedCoreProducts: matchedCoreProducts,
    activeRules,
    contextTags: Array.from(contextTagsSet),
    compatibleAccessories,
    recommendationSnippets: snippets,
    primaryOrganicPrompt: snippets[0] || ''
  };
}
