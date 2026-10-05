export interface TableInfo {
  _id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  qrCode?: string;
}

export interface Branch {
  _id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  tableCount?: number;
  tables?: TableInfo[];
  qrCode?: string;
  googleReviewUrl?: string;
  wifiSSID?: string;
  wifiPassword?: string;
  wifiQR?: string;
  qrDesign?: {
    fgColor: string;
    bgColor: string;
    dotStyle: string;
    cornerStyle: string;
    logo?: string;
  };
  qrHistory?: {
    _id: string;
    kind: 'branch' | 'table';
    ref: string;
    url: string;
    qrCode: string;
    createdAt: string;
  }[];
}
