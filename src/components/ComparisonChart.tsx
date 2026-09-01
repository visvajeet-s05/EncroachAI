import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export interface ChartSeries {
  key: string;
  label: string;
  color: 'red' | 'amber' | 'green' | string;
}

export interface ComparisonChartProps {
  id?: string;
  type: 'bar' | 'line';
  data: Array<Record<string, any>>;
  series: ChartSeries[];
  xKey: string;
  yLabel?: string;
  height?: number;
  unit?: string;
}

const COLOR_MAP: Record<string, string> = {
  red: '#E74C3C',
  amber: '#F5A623',
  green: '#2ECC71',
};

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1B222D] border border-[#242C38] rounded-lg p-3.5 shadow-2xl shadow-black/80 backdrop-blur-md">
        <p className="text-xs font-mono font-semibold text-[#F2F4F7] mb-2 pb-1.5 border-b border-[#242C38]">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            const color = entry.color || entry.stroke || entry.fill;
            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-[#8B94A3]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {entry.value} {unit || ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  id,
  type,
  data,
  series,
  xKey,
  yLabel,
  height = 360,
  unit = 'sec',
}) => {
  const getColorHex = (colorStr: string) => COLOR_MAP[colorStr] || colorStr;

  return (
    <div id={id || 'comparison-chart-wrapper'} className="w-full h-full min-h-[320px]">
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#242C38" vertical={false} />
            <XAxis
              dataKey={xKey}
              stroke="#8B94A3"
              fontSize={12}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={{ stroke: '#242C38' }}
            />
            <YAxis
              stroke="#8B94A3"
              fontSize={12}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={{ stroke: '#242C38' }}
              label={
                yLabel
                  ? {
                      value: yLabel,
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#8B94A3',
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono, monospace',
                      dx: -2,
                    }
                  : undefined
              }
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Legend
              wrapperStyle={{
                paddingTop: 12,
                fontSize: 12,
                fontFamily: 'JetBrains Mono, monospace',
              }}
              formatter={(value) => <span className="text-[#8B94A3] hover:text-white transition-colors">{value}</span>}
            />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={getColorHex(s.color)}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={600}
              />
            ))}
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#242C38" vertical={false} />
            <XAxis
              dataKey={xKey}
              stroke="#8B94A3"
              fontSize={12}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={{ stroke: '#242C38' }}
            />
            <YAxis
              stroke="#8B94A3"
              fontSize={12}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={{ stroke: '#242C38' }}
              label={
                yLabel
                  ? {
                      value: yLabel,
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#8B94A3',
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono, monospace',
                      dx: -2,
                    }
                  : undefined
              }
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Legend
              wrapperStyle={{
                paddingTop: 12,
                fontSize: 12,
                fontFamily: 'JetBrains Mono, monospace',
              }}
              formatter={(value) => <span className="text-[#8B94A3] hover:text-white transition-colors">{value}</span>}
            />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={getColorHex(s.color)}
                strokeWidth={2.5}
                dot={{ fill: getColorHex(s.color), r: 4, strokeWidth: 1.5, stroke: '#131820' }}
                activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={800}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
