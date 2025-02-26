// src/components/dashboard/OccupancyRateChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

interface OccupancyData {
  month: string;
  rate: number;
}

interface OccupancyRateChartProps {
  data: OccupancyData[];
  title?: string;
}

const OccupancyRateChart: React.FC<OccupancyRateChartProps> = ({ 
  data, 
  title = 'Occupancy Rate Trend' 
}) => {
  return (
    <Card title={title}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Occupancy Rate']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="rate"
              name="Occupancy Rate"
              stroke="#27AE60"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default OccupancyRateChart;