export type SettingsTab = 'INFO' | 'REST' | 'LOGIN' | 'MAPS' | 'MEMBERSHIP' | 'PAYMENTS';

export interface IRestaurantProfile {
  name: string;
  slug: string;
  logo: string;
  description: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
}

export interface IPaymentTransaction {
  id: string;
  amount: string | number;
  method: string;
  status: string;
  transactionId?: string | null;
  orderId: string;
  createdAt: string;
  order: {
    orderNo: number;
    status: string;
    branch?: { name: string };
    customer?: { name: string; email: string };
  };
}

export interface IBranchLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}
