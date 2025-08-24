"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  invoicesApi,
  learnersApi,
  tracksApi,
  queryKeys,
  InvoiceWithLearner,
} from "@/lib/api";
import OverviewCard from "@/components/dashboard/overview-cards";
import Trackcard from "@/components/dashboard/track-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";
import { calculateDashboardMetrics } from "@/lib/dashboard-analytics";
import PeopleCommunity from "@/components/icons/people-community";
import CurrencyDollar from "@/components/icons/currency-dollar";
import Invoice from "@/components/icons/invoice";
import { RevenueChart, TimePeriodSelector } from "@/components/charts";
import type { ChartVariant } from "@/components/charts";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = React.useState("6months");
  const [chartConfig, setChartConfig] = React.useState<{
    period: ChartVariant;
    lastMonths?: number;
  }>({
    period: "lastMonths",
    lastMonths: 6,
  });

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

  // Calculate overview metrics using helper functions
  const metrics = calculateDashboardMetrics(learners, invoices);

  // Latest invoices for table
  const latestInvoices: InvoiceWithLearner[] = invoices.slice(0, 5);

  // Get learner initials for profile image placeholder
  const getLearnerInitials = (
    learner: {
      firstName: string;
      lastName: string;
      email: string;
      profileImage?: string;
    } | null
  ) => {
    if (!learner) return "U";
    return `${learner.firstName?.charAt(0) || ""}${
      learner.lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 font-figtree">
        <h2 className="font-semibold text-2xl text-foreground">
          Welcome {user?.firstName || "Admin"} 👋
        </h2>
        <p className="text-[18px] text-muted-foreground">
          Track activity, trends, and popular destinations in real time
        </p>
      </div>

      {/* Overview Cards */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <OverviewCard
            title="Total Learners"
            value={
              learnersLoading ? "..." : metrics.totalLearners.toLocaleString()
            }
            icon={<PeopleCommunity />}
            change={metrics.learnersChange?.change}
            isPositive={metrics.learnersChange?.isPositive}
          />
          <OverviewCard
            title="Revenue"
            value={
              invoicesLoading
                ? "..."
                : `$${metrics.totalRevenue.toLocaleString()}`
            }
            icon={<CurrencyDollar />}
            change={metrics.revenueChange?.change}
            isPositive={metrics.revenueChange?.isPositive}
          />
          <OverviewCard
            title="Invoice"
            value={
              invoicesLoading ? "..." : metrics.totalInvoices.toLocaleString()
            }
            icon={<Invoice />}
            change={metrics.invoicesChange?.change}
            isPositive={metrics.invoicesChange?.isPositive}
          />
        </div>
      </div>

      {/* Popular Tracks */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tracks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tracksLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={index}
                className="rounded-[20px] shadow-lg overflow-hidden p-0"
              >
                <div className="space-y-4">
                  <div className="h-[180px] bg-muted rounded-t-md animate-pulse" />
                  <div className="px-4 space-y-3">
                    <div className="h-6 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              </Card>
            ))
          ) : tracks.length > 0 ? (
            tracks
              .slice(0, 4)
              .map((track) => (
                <Trackcard key={track.id} track={track} minimal />
              ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No tracks available</p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart and Latest Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-semibold text-[20px] leading-[28px] font-figtree py-3.5 border-b-1">
              Recent Revenue
            </CardTitle>
            <TimePeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={(period, config) => {
                setSelectedPeriod(period);
                setChartConfig(config);
              }}
              size="sm"
            />
          </CardHeader>
          <CardContent>
            <RevenueChart
              invoices={invoices}
              variant={chartConfig.period}
              lastMonths={chartConfig.lastMonths}
              showTitle={false}
              height={280}
              barColor="#3B82F6"
            />
          </CardContent>
        </Card>

        {/* Latest Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-[20px] leading-[28px] font-figtree py-3.5 border-b-1">
              Latest Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-none">
                    <TableHead className="px-6 h-14">NAME</TableHead>
                    <TableHead className="px-6 h-14">AMOUNT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={index} className="!h-[76px]">
                        <TableCell className="px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-full animate-pulse flex-shrink-0" />
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : latestInvoices.length > 0 ? (
                    latestInvoices.slice(0, 3).map((invoice, index) => (
                      <TableRow
                        key={invoice.id}
                        className={`h-[76px] border-none ${
                          index % 2 === 0 ? "bg-[#F9FBFC]" : ""
                        }`}
                      >
                        <TableCell className="px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                              {invoice.learnerId?.profileImage ? (
                                <Image
                                  src={invoice.learnerId.profileImage}
                                  alt={`${invoice.learnerId.firstName} ${invoice.learnerId.lastName}`}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-sm font-bold">
                                  {getLearnerInitials(invoice.learnerId)}
                                </div>
                              )}
                            </div>
                            <span className="font-medium">
                              {invoice.learnerId
                                ? `${invoice.learnerId.firstName} ${invoice.learnerId.lastName}`
                                : "Unknown Learner"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <p className="font-semibold">
                            ${invoice.amount.toLocaleString()}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-8 px-6">
                        <p className="text-muted-foreground">
                          No invoices found
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
