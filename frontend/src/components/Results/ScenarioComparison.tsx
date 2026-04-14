import type { SimulationResponse } from '../../types/simulation';
import { cardStyle, sectionTitleStyle } from '../InputForm/styles';
import type { CSSProperties } from 'react';

interface Scenario {
  name: string;
  response: SimulationResponse;
}

interface ScenarioComparisonProps {
  scenarios: Scenario[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

type CellColor = 'green' | 'yellow' | 'red' | 'neutral';

function getCellStyle(color: CellColor): CSSProperties {
  const colors: Record<CellColor, CSSProperties> = {
    green: { backgroundColor: '#f0fdf4', color: '#166534' },
    yellow: { backgroundColor: '#fefce8', color: '#854d0e' },
    red: { backgroundColor: '#fef2f2', color: '#991b1b' },
    neutral: {},
  };
  return colors[color];
}

function rateSuccessRate(values: number[]): CellColor[] {
  return values.map((v) => {
    if (v >= 0.8) return 'green';
    if (v >= 0.6) return 'yellow';
    return 'red';
  });
}

function rankHigherIsBetter(values: number[]): CellColor[] {
  if (values.length <= 1) return values.map(() => 'neutral');
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max === min) return values.map(() => 'neutral');
  return values.map((v) => {
    if (v === max) return 'green';
    if (v === min) return 'red';
    return 'yellow';
  });
}

function rankLowerIsBetter(values: number[]): CellColor[] {
  if (values.length <= 1) return values.map(() => 'neutral');
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max === min) return values.map(() => 'neutral');
  return values.map((v) => {
    if (v === min) return 'green';
    if (v === max) return 'red';
    return 'yellow';
  });
}

interface RowDef {
  label: string;
  extract: (r: SimulationResponse) => number;
  format: (v: number) => string;
  colorize: (values: number[]) => CellColor[];
}

const rows: RowDef[] = [
  {
    label: 'Success Rate',
    extract: (r) => r.successRate,
    format: formatPercent,
    colorize: rateSuccessRate,
  },
  {
    label: 'Median Ending Balance',
    extract: (r) => r.medianEndingBalance,
    format: formatCurrency,
    colorize: rankHigherIsBetter,
  },
  {
    label: 'Avg Effective Tax Rate',
    extract: (r) => r.averageEffectiveTaxRate,
    format: formatPercent,
    colorize: rankLowerIsBetter,
  },
  {
    label: 'SoR Risk Rate',
    extract: (r) => r.sequenceOfReturnsRisk.adverseScenarioRate,
    format: formatPercent,
    colorize: rankLowerIsBetter,
  },
];

const cellBase: CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: 14,
  textAlign: 'center',
};

export default function ScenarioComparison({ scenarios }: ScenarioComparisonProps) {
  const maxSlots = 3;
  const emptySlots = maxSlots - scenarios.length;

  return (
    <div style={cardStyle}>
      <h3 style={sectionTitleStyle}>Scenario Comparison</h3>
      {scenarios.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>
          No scenarios saved yet. Run a simulation and save the results to compare scenarios side by side.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...cellBase, textAlign: 'left', fontWeight: 600, color: '#374151' }}>Metric</th>
                {scenarios.map((s) => (
                  <th key={s.name} style={{ ...cellBase, fontWeight: 600, color: '#374151' }}>
                    {s.name}
                  </th>
                ))}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <th key={`empty-${i}`} style={{ ...cellBase, color: '#9ca3af', fontWeight: 400, fontStyle: 'italic' }}>
                    Save current scenario
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const values = scenarios.map((s) => row.extract(s.response));
                const colors = row.colorize(values);
                return (
                  <tr key={row.label}>
                    <td style={{ ...cellBase, textAlign: 'left', fontWeight: 500, color: '#555' }}>
                      {row.label}
                    </td>
                    {scenarios.map((s, i) => (
                      <td key={s.name} style={{ ...cellBase, fontWeight: 600, ...getCellStyle(colors[i]) }}>
                        {row.format(values[i])}
                      </td>
                    ))}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <td key={`empty-${i}`} style={{ ...cellBase, color: '#d1d5db' }}>—</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
