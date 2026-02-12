// Categorías que requieren suscripción premium
export const PREMIUM_CATEGORIES = [
  'Guerra Espiritual',
  'Planeta extremo'
];

export function isPremiumCategory(category) {
  return PREMIUM_CATEGORIES.includes(category);
}
