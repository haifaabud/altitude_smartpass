export const cafeConfig = {
  name: 'Altitude Coffee',
  currency: 'AED',
  theme: {
    primary: '#442D20',
    logoNavy: '#132850',
    accent: '#B8895B',
    cream: '#F7F2EA',
    surface: '#FFFDFA',
    border: '#E8DED2',
    text: '#33261D',
    textSecondary: '#796E65',
    tint: '#EFE5D9',
  },
  budgetPresets: [50, 100, 150],
  loyalty: {
    rewardThreshold: 100,
    rewardDescription: 'A brewed café drink after eligible Altitude Coffee purchases.',
    provisionalDemoValues: true,
    pointsPerQualifyingPurchase: 10,
    responsibleSpendingPeriodBonus: 25,
    maxQualifyingPurchaseRewardsPerDay: 1,
  },
} as const;

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: cafeConfig.currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
