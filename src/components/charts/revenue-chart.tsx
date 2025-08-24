'use client';

import React, { useMemo } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Invoice, InvoiceWithLearner } from '@/lib/api';

// Chart data structure for revenue
export interface RevenueDataPoint {
  period: string;
  revenue: number;
  label: string; // For tooltip display
}

// Chart variant types
export type ChartVariant = 'lastMonths' | 'yearlyComparison' | 'customRange';
export type ChartPeriod = 'monthly' | 'quarterly' | 'yearly';

interface RevenueChartProps {
  // Data and display
  invoices?: (Invoice | InvoiceWithLearner)[];
  title?: string;
  showTitle?: boolean;
  headerActions?: React.ReactNode; // For custom header content like TimePeriodSelector
  
  // Variants
  variant?: ChartVariant;
  period?: ChartPeriod;
  lastMonths?: number; // For 'lastMonths' variant
  
  // Styling
  height?: number;
  showAverage?: boolean;
  barColor?: string;
  
  // Custom date range (for 'customRange' variant)
  startDate?: Date;
  endDate?: Date;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  invoices = [],
  title = 'Revenue Overview',
  showTitle = true,
  headerActions,
  variant = 'lastMonths',
  period = 'monthly',
  lastMonths = 6,
  height = 320,
  showAverage = true,
  barColor = '#3B82F6'
}) => {
  // Generate chart data based on variant and period
  const chartData = useMemo(() => {
    const data: RevenueDataPoint[] = [];
    const now = new Date();
    
    // Helper function to get month name
    const getMonthName = (date: Date, short = true) => {
      const months = short 
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return months[date.getMonth()];
    };

    if (variant === 'lastMonths' && period === 'monthly') {
      // Generate last N months
      for (let i = lastMonths - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        
        // Calculate revenue for this month
        const monthRevenue = invoices
          .filter(invoice => {
            const invoiceDate = new Date(invoice.createdAt);
            return invoiceDate.getFullYear() === date.getFullYear() && 
                   invoiceDate.getMonth() === date.getMonth() &&
                   invoice.status === 'paid';
          })
          .reduce((sum, invoice) => sum + invoice.amount, 0);

        data.push({
          period: getMonthName(date),
          revenue: monthRevenue,
          label: `${getMonthName(date, false)} ${date.getFullYear()}`,
        });
      }
    }

    // Add more variants as needed
    else if (variant === 'yearlyComparison') {
      // Implementation for yearly comparison
      const years = [now.getFullYear() - 1, now.getFullYear()];
      years.forEach(year => {
        const yearRevenue = invoices
          .filter(invoice => {
            const invoiceDate = new Date(invoice.createdAt);
            return invoiceDate.getFullYear() === year && invoice.status === 'paid';
          })
          .reduce((sum, invoice) => sum + invoice.amount, 0);

        data.push({
          period: year.toString(),
          revenue: yearRevenue,
          label: `Year ${year}`,
        });
      });
    }

    return data;
  }, [invoices, variant, period, lastMonths]);

  // Calculate average for reference line
  const averageRevenue = useMemo(() => {
    if (!showAverage || chartData.length === 0) return 0;
    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
    return totalRevenue / chartData.length;
  }, [chartData, showAverage]);

  // Custom tooltip component
  interface TooltipPayload {
    value: number;
    payload: RevenueDataPoint;
  }
  
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.label}</p>
          <p className="text-primary font-semibold">
            Revenue: ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Blue color variations for different chart states
  const chartColors = {
    primary: barColor,
    hover: '#2563EB',
    light: '#DBEAFE',
  };

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader className={headerActions ? "flex flex-row items-center justify-between space-y-0 pb-2" : ""}>
          <CardTitle className="font-semibold text-[20px] leading-[28px] font-figtree py-3.5 border-b-1">
            {title}
          </CardTitle>
          {headerActions}
        </CardHeader>
      )}
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="period" 
                axisLine={true}
                tickLine={true}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={true}
                tickLine={true}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar 
                dataKey="revenue" 
                fill={chartColors.primary}
                radius={[4, 4, 0, 0]}
              />
              
              {/* Average reference line */}
              {showAverage && averageRevenue > 0 && (
                <ReferenceLine 
                  y={averageRevenue} 
                  stroke="#6B7280" 
                  strokeDasharray="8 8"
                  strokeWidth={1.5}
                  label={{ 
                    value: "Avg", 
                    position: "right",
                    fill: "#6B7280",
                    fontSize: 12
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;