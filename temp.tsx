"use client";

import * as React from "react";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import { MonthPicker } from "./MonthPicker";
import { mockUser } from "@/lib/mocks/user";

interface StatusDataItem {
  name: string;
  value: number;
  fill: string;
}

const getDataForMonth = (date: Date | null): StatusDataItem[] => {
  if (!date) {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const data =
      mockUser.mockMonthlyData[currentMonthKey] ||
      mockUser.mockMonthlyData[0];
    return [
      { name: "On-Time", value: data.onTime, fill: "var(--bright-secondary)" },
      { name: "Delayed", value: data.delayed, fill: "var(--primary)" },
    ];
  }

  const monthKey = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
  const data =
    mockUser.mockMonthlyData[monthKey] || { onTime: 83, delayed: 17 };
  return [
    { name: "On-Time", value: data.onTime, fill: "var(--bright-secondary)" },
    { name: "Delayed", value: data.delayed, fill: "var(--primary)" },
  ];
};

const chartConfig = {
  "On-Time": {
    label: "On-Time",
    color: "var(--bright-secondary)",
  },
  Delayed: {
    label: "Delayed",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function StatusDistribution() {
  const [selectedMonth, setSelectedMonth] = React.useState<Date | null>(null);
  const [statusData, setStatusData] = React.useState<StatusDataItem[]>(
    getDataForMonth(null)
  );
  const [chartSize, setChartSize] = React.useState({ width: 0, height: 0 });
  const [delayedRightOffset, setDelayedRightOffset] = React.useState(0);
  const chartContainerRef = React.useRef<HTMLDivElement>(null);

  const handleMonthChange = (date: Date | null) => {
    setSelectedMonth(date);
    setStatusData(getDataForMonth(date));
  };

  React.useEffect(() => {
    const updateSize = () => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.clientWidth;
        const height = Math.min(width, 250);
        setChartSize({ width, height });
      }
    };

    const updateRightOffset = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) {
        setDelayedRightOffset(chartSize.width * -0.03);
      } else if (screenWidth < 1024) {
        setDelayedRightOffset(chartSize.width * 0.15);
      } else {
        setDelayedRightOffset(chartSize.width * 0.2);
      }
    };

    updateSize();
    updateRightOffset();
    window.addEventListener("resize", updateSize);
    window.addEventListener("resize", updateRightOffset);

    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("resize", updateRightOffset);
    };
  }, [chartSize.width]);

  const centerTextSize = React.useMemo(() => {
    const baseSize = Math.max(16, Math.min(24, chartSize.width / 10));
    return {
      value: baseSize,
      label: baseSize * 0.8,
    };
  }, [chartSize.width]);

  return (
    <Card className="w-full overflow-hidden border border-gray-200 rounded-[10px]">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between border-b pb-2 gap-2 px-0">
        <CardTitle className="text-base sm:text-lg md:text-xl font-bold">
          Status Distribution
        </CardTitle>
        <MonthPicker onChange={handleMonthChange} value={selectedMonth} />
      </CardHeader>
      <CardContent className="flex justify-center pt-4 pb-0">
        <div
          ref={chartContainerRef}
          className="relative w-full h-auto flex items-center justify-center"
          style={{ minHeight: "160px" }}
        >
          {chartSize.width > 0 && (
            <>
              <ChartContainer config={chartConfig} className="w-[60%] h-full">
                <ResponsiveContainer width="100%" height={chartSize.height}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="85%"
                      dataKey="value"
                      startAngle={300}
                      endAngle={-90}
                      stroke="none"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div
                  className="font-normal"
                  style={{
                    fontSize: `${centerTextSize.value}px`,
                    lineHeight: "100%",
                  }}
                >
                  {statusData[0].value}%
                </div>
                <div
                  className="font-normal text-green-400"
                  style={{
                    fontSize: `${centerTextSize.label}px`,
                    lineHeight: "100%",
                  }}
                >
                  {statusData[0].name}
                </div>
              </div>

              <div
                className="absolute flex flex-col items-center justify-center text-center"
                style={{
                  right: `${delayedRightOffset}px`,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <div
                  className="font-normal"
                  style={{
                    fontSize: `${centerTextSize.label}px`,
                    lineHeight: "100%",
                  }}
                >
                  {statusData[1].value}%
                </div>
                <div
                  className="font-normal text-primary"
                  style={{
                    fontSize: `${centerTextSize.label}px`,
                    lineHeight: "100%",
                  }}
                >
                  {statusData[1].name}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-8 pt-0 pb-4 px-0">
        {statusData.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-[16px] h-[16px] sm:w-[24px] sm:h-[24px] rounded-full"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="text-sm sm:text-base">{entry.name}</span>
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}