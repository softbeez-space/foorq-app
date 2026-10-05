export interface Offer {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  type: 'discount' | 'bogo' | 'free_item';
  discountType?: 'percentage' | 'fixed';
  discountValue: number;
  applicableItems: string[];
  applicableCategories: string[];
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  promoCode?: string;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}
