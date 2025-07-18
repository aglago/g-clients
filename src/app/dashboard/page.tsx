"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { invoicesApi, learnersApi } from "@/lib/api";
import OverviewCard from "@/components/dashboard/overview-cards";
import Trackcard from "@/components/dashboard/track-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { calculateDashboardMetrics } from "@/lib/dashboard-analytics";
import PeopleCommunity from "@/components/icons/people-community";
import CurrencyDollar from "@/components/icons/currency-dollar";
import Invoice from "@/components/icons/invoice";

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  // Fetch data using React Query
  const { data: learners = [], isLoading: learnersLoading } = useQuery({
    queryKey: ['learners'],
    queryFn: learnersApi.getAllLearners,
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoicesApi.getAllInvoices,
  });

  // Calculate overview metrics using helper functions
  const metrics = calculateDashboardMetrics(learners, invoices);

  // Mock data for tracks (since we don't have tracks API yet)
  const mockTracks = [
    {
      title: "Software Engineering",
      weeks: "12",
      courses: ["Nodejs", "Reactjs"],
      imageUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop"
    },
    {
      title: "Cloud Computing", 
      weeks: "12",
      courses: ["Azure", "AWS", "Machine Learning"],
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop"
    },
    {
      title: "Data Science",
      weeks: "8", 
      courses: ["PowerBi", "Python", "User Research"],
      imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop"
    },
    {
      title: "UI/UX Design",
      weeks: "8", 
      courses: ["Figma", "Sketch", "User Research"],
      imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop"
    }
  ];

  // Latest invoices for table
  const latestInvoices = invoices.slice(0, 5);

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 font-figtree">
        <h2 className="font-semibold text-2xl text-foreground">
          Welcome {user?.firstName || 'Admin'} 👋
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
            value={learnersLoading ? "..." : metrics.totalLearners.toLocaleString()}
            icon={<PeopleCommunity />}
            change={metrics.learnersChange?.change}
            isPositive={metrics.learnersChange?.isPositive}
          />
          <OverviewCard
            title="Revenue"
            value={invoicesLoading ? "..." : `$${metrics.totalRevenue.toLocaleString()}`}
            icon={<CurrencyDollar />}
            change={metrics.revenueChange?.change}
            isPositive={metrics.revenueChange?.isPositive}
          />
          <OverviewCard
            title="Invoice"
            value={invoicesLoading ? "..." : metrics.totalInvoices.toLocaleString()}
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
          {mockTracks.map((track, index) => (
            <Trackcard
              key={index}
              title={track.title}
              weeks={track.weeks}
              courses={track.courses}
              imageUrl={track.imageUrl}
            />
          ))}
        </div>
      </div>

      {/* Revenue Chart and Latest Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Chart component will be rendered here</p>
            </div>
          </CardContent>
        </Card>

        {/* Latest Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoicesLoading ? (
                <p className="text-muted-foreground">Loading invoices...</p>
              ) : latestInvoices.length > 0 ? (
                latestInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Invoice #{invoice.id.slice(-6)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${invoice.amount.toLocaleString()}</p>
                      <p className={`text-sm ${
                        invoice.status === 'paid' ? 'text-green-600' : 
                        invoice.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No invoices found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
