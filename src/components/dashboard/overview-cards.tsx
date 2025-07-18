import React from "react";
import { Card } from "../ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface OverviewCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  isPositive?: boolean;
}

export default function OverviewCard({
  title,
  value,
  icon,
  change,
  isPositive,
}: OverviewCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-6 bg-card">
      <h3 className="text-[16px] font-medium leading-[24px] text-overview-heading">
        {title}
      </h3>
      <div className="flex items-center">
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-4xl text-foreground">{value}</h3>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className="ml-auto text-foreground">
          <span className="w-[78px] h-[78px]">{icon}</span>
        </div>
      </div>
    </Card>
  );
}
