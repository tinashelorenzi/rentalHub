// src/components/dashboard/PropertyStatusChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from '../common/Card';

interface PropertyStatusData {
  status: string;
  count: number;
}

interface PropertyStatusChartProps {
  data: PropertyStatusData[];
}

const COLORS = ['#2A9DF4', '#27AE60', '#E67E22'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PropertyStatusChart: React.FC<PropertyStatusChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card title="Property Status Distribution">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} properties`, 'Count']}
              labelFormatter={(label) => `Status: ${label}`}
            />
            <Legend 
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value) => `${value} (${data.find(d => d.status === value)?.count || 0})`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PropertyStatusChart;