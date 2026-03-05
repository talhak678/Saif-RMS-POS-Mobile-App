export interface IReportSummaryItem {
  total: number;
  change: number;
}

export interface IReportData {
  summary: {
    payments: IReportSummaryItem;
    revenue:  IReportSummaryItem;
    tips:     IReportSummaryItem;
  };
  salesTrend: {
    daily:   { date: string; sales: number; orders: number }[];
    weekly:  { date: string; sales: number; orders: number }[];
    monthly: { date: string; sales: number; orders: number }[];
  };
  ordersCustomers: {
    orderSource:       { name: string; value: number; color: string }[];
    customerLocations: { area: string; orders: number }[];
  };
  inventory: {
    stockConsumption: { ingredient: string; consumed: number }[];
    recipePopularity: { recipe: string; revenue: number }[];
  };
  branches: {
    salesPerBranch: { branch: string; sales: number; orders: number }[];
  };
  menuCategories: {
    salesByCategory: { category: string; value: number; color: string }[];
    topSellingItems: { item: string; sales: number }[];
  };
}

export type TimeRange = 'daily' | 'weekly' | 'monthly';
