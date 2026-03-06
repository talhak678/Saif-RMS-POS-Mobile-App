export type RiderStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export interface IRider {
  id: string;
  name: string;
  phone: string;
  status: RiderStatus;
  createdAt: string;
  restaurantId: string;
}

export interface IRiderForm {
  name: string;
  phone: string;
  status: RiderStatus;
}

export const getStatusConfig = (status: RiderStatus) => {
  switch (status) {
    case 'AVAILABLE':
      return { bg: '#d1fae5', text: '#065f46', dot: '#10b981', label: 'Available' };
    case 'BUSY':
      return { bg: '#ffedd5', text: '#9a3412', dot: '#f97316', label: 'Busy' };
    case 'OFFLINE':
      return { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af', label: 'Offline' };
    default:
      return { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af', label: status };
  }
};
