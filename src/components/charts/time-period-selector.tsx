'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TimePeriod = 'lastMonths' | 'yearlyComparison' | 'customRange';

interface TimePeriodOption {
  value: string;
  label: string;
  period: TimePeriod;
  lastMonths?: number;
}

interface TimePeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string, config: { period: TimePeriod; lastMonths?: number }) => void;
  variant?: 'select' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
}

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  variant = 'select',
  size = 'md',
}) => {
  const periodOptions: TimePeriodOption[] = [
    { value: '3months', label: 'Last 3 Months', period: 'lastMonths', lastMonths: 3 },
    { value: '6months', label: 'Last 6 Months', period: 'lastMonths', lastMonths: 6 },
    { value: '12months', label: 'Last 12 Months', period: 'lastMonths', lastMonths: 12 },
    { value: 'yearly', label: 'Yearly Comparison', period: 'yearlyComparison' },
  ];

  const handleChange = (value: string) => {
    const option = periodOptions.find(opt => opt.value === value);
    if (option) {
      onPeriodChange(value, { 
        period: option.period, 
        lastMonths: option.lastMonths 
      });
    }
  };

  if (variant === 'buttons') {
    return (
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {periodOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedPeriod === option.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleChange(option.value)}
            className="text-xs"
          >
            {option.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Select value={selectedPeriod} onValueChange={handleChange}>
      <SelectTrigger className={`w-[180px] ${size === 'sm' ? 'h-8 text-xs' : size === 'lg' ? 'h-12' : 'h-10'}`}>
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {periodOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TimePeriodSelector;