import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Mon', count: 420 },
  { name: 'Tue', count: 380 },
  { name: 'Wed', count: 510 },
  { name: 'Thu', count: 490 },
  { name: 'Fri', count: 680 },
  { name: 'Sat', count: 310 },
  { name: 'Sun', count: 240 },
];

/**
 * High-end Bar Chart component following GeePay Design System section 11.
 * Features top-to-bottom bar gradients and clean financial typography.
 */
export const BarChartPremium: React.FC = () => {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            {/* Standard Cobalt Gradient — as specified in section 11.1 */}
            <linearGradient id="barGradientCobalt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#383d92" stopOpacity={0.90} />
              <stop offset="100%" stopColor="#383d92" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#EEF0F5" 
          />
          
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontFamily: 'Inter', fill: '#9AA0B8' }}
            dy={10}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontFamily: 'Inter', fill: '#9AA0B8' }}
          />
          
          <Tooltip 
            cursor={{ fill: '#F7F8FA' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-gray-100 shadow-xl rounded-xl p-3">
                    <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                      {payload[0].payload.name}
                    </p>
                    <p className="font-mono font-bold text-text-sm text-gray-900">
                      {payload[0].value} <span className="text-gray-400 font-normal">txns</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Bar 
            dataKey="count" 
            fill="url(#barGradientCobalt)" 
            radius={[6, 6, 0, 0]} 
            barSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
