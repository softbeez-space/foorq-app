export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  tagline: string;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceAnnual: 0,
    tagline: 'Get started with one branch',
    features: ['1 Branch', 'Digital Menu', 'Up to 30 menu items', 'QR codes', 'Basic dashboard'],
  },
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 29,
    priceAnnual: 290,
    tagline: 'For growing single-location restaurants',
    features: [
      '1 Branch',
      'Unlimited menu items',
      'Live orders + KDS',
      'Tables & floor view',
      'Expenses tracking',
      'Email support',
    ],
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 79,
    priceAnnual: 790,
    tagline: 'Multi-branch with analytics & CRM',
    features: [
      'Unlimited branches',
      'Analytics & insights',
      'Customer CRM + loyalty',
      'Offers & promotions',
      'Staff management',
      'Priority support',
    ],
  },
];
