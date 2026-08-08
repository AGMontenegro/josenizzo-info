// Categorías que requieren suscripción premium
export const PREMIUM_CATEGORIES = [
  'Guerra Espiritual'
];

export function isPremiumCategory(category) {
  return PREMIUM_CATEGORIES.includes(category);
}
