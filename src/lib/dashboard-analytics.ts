import { Learner, Invoice } from './api';

export interface PercentageChange {
  change: number;
  isPositive: boolean;
}

export interface DashboardMetrics {
  totalLearners: number;
  totalRevenue: number;
  totalInvoices: number;
  learnersChange: PercentageChange | null;
  revenueChange: PercentageChange | null;
  invoicesChange: PercentageChange | null;
}

/**
 * Calculate percentage change between current month and last month for count-based metrics
 */
export const calculateCountChange = <T extends { createdAt: string }>(
  data: T[],
  dateField: keyof T = 'createdAt' as keyof T
): PercentageChange | null => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const currentMonthData = data.filter(item => {
    const itemDate = new Date(item[dateField] as string);
    return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
  });
  
  const lastMonthData = data.filter(item => {
    const itemDate = new Date(item[dateField] as string);
    return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === lastMonthYear;
  });
  
  if (lastMonthData.length === 0) return null;
  
  const change = ((currentMonthData.length - lastMonthData.length) / lastMonthData.length) * 100;
  return {
    change: Math.round(change),
    isPositive: change >= 0
  };
};

/**
 * Calculate percentage change between current month and last month for revenue
 */
export const calculateRevenueChange = (
  invoices: Invoice[]
): PercentageChange | null => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const currentMonthRevenue = invoices
    .filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
    })
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  
  const lastMonthRevenue = invoices
    .filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate.getMonth() === lastMonth && invoiceDate.getFullYear() === lastMonthYear;
    })
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  
  if (lastMonthRevenue === 0) return null;
  
  const change = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
  return {
    change: Math.round(change),
    isPositive: change >= 0
  };
};

/**
 * Generate mock percentage changes for demo purposes
 */
const generateMockChanges = (): {
  learnersChange: PercentageChange;
  revenueChange: PercentageChange;
  invoicesChange: PercentageChange;
} => ({
  learnersChange: {
    change: 12,
    isPositive: true
  },
  revenueChange: {
    change: 8,
    isPositive: true
  },
  invoicesChange: {
    change: 5,
    isPositive: false
  }
});

/**
 * Check if data is using mock/old dates (before current year)
 */
const isMockData = (data: { createdAt: string }[]): boolean => {
  if (data.length === 0) return true;
  const currentYear = new Date().getFullYear();
  return data.some(item => new Date(item.createdAt).getFullYear() < currentYear);
};

/**
 * Calculate all dashboard metrics with percentage changes
 */
export const calculateDashboardMetrics = (
  learners: Learner[],
  invoices: Invoice[]
): DashboardMetrics => {
  const totalLearners = learners.length;
  const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const totalInvoices = invoices.length;

  // Check if we're using mock data (old dates)
  const usingMockData = isMockData([...learners, ...invoices]);

  let learnersChange: PercentageChange | null;
  let invoicesChange: PercentageChange | null;
  let revenueChange: PercentageChange | null;

  if (usingMockData) {
    // Use mock changes for demo purposes
    const mockChanges = generateMockChanges();
    learnersChange = mockChanges.learnersChange;
    invoicesChange = mockChanges.invoicesChange;
    revenueChange = mockChanges.revenueChange;
  } else {
    // Use real calculations for live data
    learnersChange = calculateCountChange(learners);
    invoicesChange = calculateCountChange(invoices);
    revenueChange = calculateRevenueChange(invoices);
  }

  return {
    totalLearners,
    totalRevenue,
    totalInvoices,
    learnersChange,
    revenueChange,
    invoicesChange
  };
};