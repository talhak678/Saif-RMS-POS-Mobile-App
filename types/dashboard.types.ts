export type DashboardPeriod = 'today' | '7d' | '30d' | '90d';

export interface IDashboardData {
  period: string;
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  websiteOrders: number;
  avgOrderValue: number;
  newCustomers: number;
  totalCustomers: number;
  growth: {
    totalSales: number | null;
    revenue: number | null;
    orders: number | null;
    websiteOrders: number | null;
    newCustomers: number | null;
  };
  statusBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  topItems: { name: string; quantity: number }[];
  monthlySales: { month: string; revenue: number; orders: number }[];
  hourlyOrders: { hour: string; count: number }[];
  categoryRevenue: { name: string; revenue: number; quantity: number }[];
  recentReviews: {
    id: string;
    rating: number;
    comment: string | null;
    customerName: string;
    createdAt: string;
  }[];
}
