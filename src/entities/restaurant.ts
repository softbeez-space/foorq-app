export interface RestaurantSettings {
  currency: string;
  timezone: string;
  taxRate: number;
  vatEnabled?: boolean;
  vatType?: 'ordinary' | 'ac-hotel' | 'nonac-hotel' | 'other';
  bin?: string;
  vatRate?: number;
  enableOrdering: boolean;
  restrictOrdersToWifi: boolean;
  enableTablePayment: boolean;
  enableLoyalty: boolean;
  paymentMethods: {
    cash: boolean;
    bkash: boolean;
    sslcommerz: boolean;
  };
  qrDesign?: {
    fgColor: string;
    bgColor: string;
    dotStyle: string;
    cornerStyle: string;
    logo?: string;
  };
}

export interface RestaurantFull {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  accentColor: string;
  description: string;
  cuisine: string[];
  settings: RestaurantSettings;
  status: 'active' | 'inactive' | 'suspended';
  planSetupComplete: boolean;
}
