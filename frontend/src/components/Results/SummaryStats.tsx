import type { SimulationResponse } from '../../types/simulation';
import { cardStyle } from '../InputForm/styles';

interface SummaryStatsProps {
  response: SimulationResponse;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getSuccessRateColor(rate: number): string {
  if (rate >= 0.8) return '#16a34a';
  if (rate >= 0.6) return '#ca8a04';
  return '#dc2626';
}

function getSuccessRateBg(rate: number): string {
  if (rate >= 0.8) return '#f0fdf4';
  if (rate >= 0.6) return '#fefce8';
  return '#fef2f2';
}

export default function SummaryStats({ response }: SummaryStatsProps) {
  const totalSocialSecurity = response.socialSecurityBreakdown.reduce(
    (sum, year) => sum + year.annualBenefit,
    0,
  );

  const stats = [
    {
      label: 'Success Rate',
      value: `${(response.successRate * 100).toFixed(1)}%`,
      color: getSuccessRateColor(response.successRate),
      bg: getSuccessRateBg(response.successRate),
    },
    {
      label: 'Median Ending Balance',
      value: formatCurrency(response.medianEndingBalance),
      color: '#1e40af',
      bg: '#eff6ff',
    },
    {
      label: 'Average Effective Tax Rate',
      value: `${(response.averageEffectiveTaxRate * 100).toFixed(1)}%`,
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
    {
      label: 'Total Social Security Benefits',
      value: formatCurrency(totalSocialSecurity),
      color: '#0891b2',
      bg: '#ecfeff',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            ...cardStyle,
            backgroundColor: stat.bg,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: 120,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 8 }}>
            {stat.label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
