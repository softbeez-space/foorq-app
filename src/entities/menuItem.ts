export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: { _id: string; name: string; slug: string } | null;
  image?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  type: 'standard' | 'bundle';
  variants: { name: string; price: number }[];
  addons: { name: string; price: number }[];
  tags: string[];
  relatedItems?: { menuItemId: any; source?: string; score?: number }[];
  preparationTime?: number;
  spiceLevel?: number;
  sortOrder: number;
  /** Null/undefined = stock not tracked. */
  stockQty?: number | null;
  lowThreshold?: number;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  visitCount: number;
}
