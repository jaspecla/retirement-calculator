import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';
import type { SimulationResponse } from '../../types/simulation';
import { cardStyle, sectionTitleStyle } from '../InputForm/styles';

interface FanChartProps {
  response: SimulationResponse;
}

interface ChartDataPoint {
  age: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload as ChartDataPoint | undefined;
  if (!data) return null;

  return (
    <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: 12, fontSize: 13 }}>
      <p style={{ margin: '0 0 6px', fontWeight: 600 }}>Age {label}</p>
      {(['p90', 'p75', 'p50', 'p25', 'p10'] as const).map((key) => (
        <p key={key} style={{ margin: '2px 0', color: key === 'p50' ? '#1e40af' : '#555' }}>
          {key.toUpperCase()}: {formatFullCurrency(data[key])}
        </p>
      ))}
    </div>
  );
}

export default function FanChart({ response }: FanChartProps) {
  const { p10, p25, p50, p75, p90 } = response.percentiles;

  const data: ChartDataPoint[] = p50.map((_, i) => ({
    age: p50[i].age,
    p10: p10[i].portfolioValue,
    p25: p25[i].portfolioValue,
    p50: p50[i].portfolioValue,
    p75: p75[i].portfolioValue,
    p90: p90[i].portfolioValue,
  }));

  return (
    <div style={cardStyle}>
      <h3 style={sectionTitleStyle}>Portfolio Value Over Time</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} />
          <YAxis tickFormatter={formatCurrency} width={70} />
          <Tooltip content={<CustomTooltip />} />

          {/* P10–P25 band (light red) */}
          <Area type="monotone" dataKey="p10" stackId="band" stroke="none" fill="transparent" />
          <Area
            type="monotone"
            dataKey="p25"
            stackId="band"
            stroke="none"
            fill="#FEE2E2"
            fillOpacity={0.8}
            // render band between p10 and p25
            baseValue="dataMin"
          />

          {/* Render bands as independent areas with manual baselines */}
          {/* We use non-stacked overlapping areas: each subsequent area covers the one below */}
          <Area type="monotone" dataKey="p25" stroke="none" fill="#FEF3C7" fillOpacity={0.8} />
          <Area type="monotone" dataKey="p50" stroke="none" fill="#D1FAE5" fillOpacity={0.8} />
          <Area type="monotone" dataKey="p75" stroke="none" fill="#A7F3D0" fillOpacity={0.8} />
          <Area type="monotone" dataKey="p90" stroke="none" fill="#A7F3D0" fillOpacity={0.4} />

          {/* Overlay the lower areas on top to create the band effect */}
          <Area type="monotone" dataKey="p75" stroke="none" fill="#D1FAE5" fillOpacity={0.8} />
          <Area type="monotone" dataKey="p50" stroke="none" fill="#FEF3C7" fillOpacity={0.8} />
          <Area type="monotone" dataKey="p25" stroke="none" fill="#FEE2E2" fillOpacity={0.8} />
          <Area type="monotone" dataKey="p10" stroke="none" fill="#fff" fillOpacity={1} />

          {/* Median line */}
          <Line type="monotone" dataKey="p50" stroke="#1e40af" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, fontSize: 12, color: '#666' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#FEE2E2', marginRight: 4, verticalAlign: 'middle' }} /> P10–P25</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#FEF3C7', marginRight: 4, verticalAlign: 'middle' }} /> P25–P50</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#D1FAE5', marginRight: 4, verticalAlign: 'middle' }} /> P50–P75</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#A7F3D0', marginRight: 4, verticalAlign: 'middle' }} /> P75–P90</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 2, backgroundColor: '#1e40af', marginRight: 4, verticalAlign: 'middle' }} /> Median</span>
      </div>
    </div>
  );
}
