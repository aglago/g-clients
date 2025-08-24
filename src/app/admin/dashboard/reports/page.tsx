'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  tracksApi, 
  coursesApi,
  learnersApi,
  invoicesApi,
  queryKeys
} from '@/lib/api';
import { RevenueChart, TimePeriodSelector, type ChartVariant } from '@/components/charts';
import { calculateDashboardMetrics } from '@/lib/dashboard-analytics';
import PagesHeaders from '@/components/dashboard/pages-headers';
import OverviewCard from '@/components/dashboard/overview-cards';
import PeopleCommunity from '@/components/icons/people-community';
import CurrencyDollar from '@/components/icons/currency-dollar';
import { 
  DollarSign, 
  FileText, 
  BookOpen,
} from 'lucide-react';

export default function ReportsPage() {
  // State for chart configurations
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [chartConfig, setChartConfig] = useState<{ 
    period: ChartVariant; 
    lastMonths?: number 
  }>({ 
    period: 'lastMonths', 
    lastMonths: 6 
  });

  // State for top tracks sorting
  const [tracksSortBy, setTracksSortBy] = useState<'revenue' | 'enrollments' | 'completion'>('revenue');

  const { data: learners = [], isLoading: learnersLoading } = useQuery({
    queryKey: [queryKeys.learners.all],
    queryFn: learnersApi.getAllLearners,
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: [queryKeys.invoices.all],
    queryFn: invoicesApi.getAllInvoices,
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: [queryKeys.tracks.all],
    queryFn: tracksApi.getAllTracks,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: [queryKeys.courses.all],
    queryFn: coursesApi.getAllCourses,
  });

  // Calculate metrics
  const metrics = calculateDashboardMetrics(learners, invoices);

  // Revenue by status breakdown
  const revenueByStatus = {
    paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    unpaid: invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + inv.amount, 0),
    cancelled: invoices.filter(inv => inv.status === 'cancelled').reduce((sum, inv) => sum + inv.amount, 0),
  };

  // Top performing tracks - calculated from real data
  const topTracks = tracks.map((track) => {
    // Calculate enrollments for this track
    const trackLearners = learners.filter(learner => learner.trackId === track.id);
    const enrollments = trackLearners.length;
    
    // Calculate revenue from invoices for learners in this track
    const trackRevenue = invoices.filter(invoice => 
      invoice.learnerId && trackLearners.some(learner => 
        learner.email === invoice.learnerId.email
      )
    ).reduce((sum, invoice) => sum + (invoice.status === 'paid' ? invoice.amount : 0), 0);
    
    // Mock completion rate for now (would need progress tracking data)
    // In a real system, this would come from enrollment/progress data
    const completion = enrollments > 0 ? Math.min(Math.max(60 + (enrollments * 2), 65), 95) : 0;
    
    return {
      ...track,
      enrollments,
      revenue: trackRevenue,
      completion,
    };
  }).sort((a, b) => {
    // Dynamic sorting based on selected criteria
    switch (tracksSortBy) {
      case 'revenue':
        return b.revenue - a.revenue;
      case 'enrollments':
        return b.enrollments - a.enrollments;
      case 'completion':
        return b.completion - a.completion;
      default:
        return b.revenue - a.revenue;
    }
  }).slice(0, 5); // Take top 5

  const handleExportReport = () => {
    // Mock export functionality
    alert('Export functionality would be implemented here!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PagesHeaders
        heading="Analytics & Reports"
        subheading="Comprehensive insights and performance metrics"
        items={[]}
        getSearchableText={() => []}
        onSearchResults={() => {}}
        searchPlaceholder=""
        addButtonText="Export Report"
        onAddClick={handleExportReport}
        isLoading={false}
        showSearch={false}
      />

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewCard
          title="Total Revenue"
          value={invoicesLoading ? "..." : `$${metrics.totalRevenue.toLocaleString()}`}
          icon={<CurrencyDollar />}
          change={metrics.revenueChange?.change}
          isPositive={metrics.revenueChange?.isPositive}
        />
        <OverviewCard
          title="Total Learners"
          value={learnersLoading ? "..." : metrics.totalLearners.toLocaleString()}
          icon={<PeopleCommunity />}
          change={metrics.learnersChange?.change}
          isPositive={metrics.learnersChange?.isPositive}
        />
        <OverviewCard
          title="Active Courses"
          value={coursesLoading ? "..." : courses.length.toLocaleString()}
          icon={<BookOpen />}
          change={12}
          isPositive={true}
        />
        <OverviewCard
          title="Learning Tracks" 
          value={tracksLoading ? "..." : tracks.length.toLocaleString()}
          icon={<FileText />}
          change={5}
          isPositive={true}
        />
      </div>

      {/* Revenue Chart and Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <RevenueChart
            invoices={invoices}
            variant={chartConfig.period}
            lastMonths={chartConfig.lastMonths}
            showTitle={true}
            title="Revenue Trends"
            height={350}
            barColor="#3B82F6"
            headerActions={
              <TimePeriodSelector
                selectedPeriod={selectedPeriod}
                onPeriodChange={(period, config) => {
                  setSelectedPeriod(period);
                  setChartConfig(config);
                }}
                size="sm"
              />
            }
          />
        </div>

        {/* Revenue Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-[20px] leading-[28px] font-figtree py-3.5 border-b-1">
              Revenue Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Paid</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    ${revenueByStatus.paid.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((revenueByStatus.paid / metrics.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium">Unpaid</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    ${revenueByStatus.unpaid.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((revenueByStatus.unpaid / metrics.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">Cancelled</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    ${revenueByStatus.cancelled.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((revenueByStatus.cancelled / metrics.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Visual progress bars */}
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(revenueByStatus.paid / metrics.totalRevenue) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Tracks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-semibold text-[20px] leading-[28px] font-figtree py-3.5 border-b-1">
            Top Performing Tracks
          </CardTitle>
          <Select value={tracksSortBy} onValueChange={(value: 'revenue' | 'enrollments' | 'completion') => setTracksSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="enrollments">Enrollments</SelectItem>
              <SelectItem value="completion">Completion Rate</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTracks.map((track, idx) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      #{idx + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{track.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {track.instructor}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{track.enrollments}</p>
                    <p className="text-muted-foreground">Enrollments</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">${track.revenue.toLocaleString()}</p>
                    <p className="text-muted-foreground">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{track.completion}%</p>
                    <p className="text-muted-foreground">Completion</p>
                  </div>
                  <Badge 
                    variant={track.completion > 80 ? 'success' : track.completion > 60 ? 'secondary' : 'destructive'}
                  >
                    {track.completion > 80 ? 'Excellent' : track.completion > 60 ? 'Good' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-[20px] leading-[28px] font-figtree py-3.5 border-b-1">
              Recent Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {learners.slice(0, 5).map((learner) => (
                <div key={learner.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {learner.firstName.charAt(0)}{learner.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {learner.firstName} {learner.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Enrolled • {new Date(learner.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-[20px] leading-[28px] font-figtree py-3.5 border-b-1">
              Payment Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices
                .filter(inv => inv.status === 'paid')
                .slice(0, 5)
                .map((invoice) => (
                <div key={invoice.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {invoice.learnerId.firstName} {invoice.learnerId.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Payment received • {new Date(invoice.paymentDate || invoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">
                    +${invoice.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}