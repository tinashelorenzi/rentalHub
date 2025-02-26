// src/components/dashboard/RevenueChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  title?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, title = 'Monthly Revenue & Expenses' }) => {
  return (
    <Card title={title}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value, name) => [`$${value.toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Expenses']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend 
              formatter={(value) => value === 'revenue' ? 'Revenue' : 'Expenses'}
            />
            <Bar dataKey="revenue" name="Revenue" fill="#2A9DF4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#E67E22" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default RevenueChart;