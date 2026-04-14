import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SequenceOfReturnsRisk } from '../../types/simulation';
import { cardStyle, sectionTitleStyle } from '../InputForm/styles';

interface SequenceOfReturnsPanelProps {
  risk: SequenceOfReturnsRisk;
  retirementAge: number;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default function SequenceOfReturnsPanel({ risk, retirementAge }: SequenceOfReturnsPanelProps) {
  if (risk.adverseScenarioCount === 0) {
    return (
      <div style={{ ...cardStyle, borderColor: '#86efac', backgroundColor: '#f0fdf4' }}>
        <h3 style={{ ...sectionTitleStyle, color: '#166534' }}>✅ No Sequence-of-Returns Risk Detected</h3>
        <p style={{ margin: 0, color: '#15803d', fontSize: 14 }}>
          Your retirement plan appears resilient to poor early-retirement market returns.
        </p>
      </div>
    );
  }

  const adverseChart = risk.exampleAdverseScenario
    ? risk.exampleAdverseScenario.yearlyBalances.map((balance, i) => ({
        age: risk.exampleAdverseScenario!.startAge + i,
        balance,
      }))
    : null;

  return (
    <div style={{ ...cardStyle, borderColor: '#fdba74', backgroundColor: '#fffbeb' }}>
      <div style={{
        display: 'inline-block',
        backgroundColor: '#f59e0b',
        color: '#fff',
        fontWeight: 600,
        fontSize: 14,
        padding: '6px 14px',
        borderRadius: 20,
        marginBottom: 14,
      }}>
        ⚠️ Sequence of Returns Risk Detected
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatItem
          label="Failure rate from poor early returns"
          value={`${(risk.adverseScenarioRate * 100).toFixed(1)}%`}
        />
        <StatItem
          label="Average depletion age"
          value={risk.averageDepletionAge.toFixed(1)}
        />
        <StatItem
          label="Worst-case first decade avg return"
          value={`${(risk.worstCaseFirstDecadeReturn * 100).toFixed(1)}%`}
        />
      </div>

      {adverseChart && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
            Worst-Case Scenario: Portfolio Balance
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={adverseChart} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d0" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} />
              <YAxis tickFormatter={formatCurrency} width={70} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Age ${label}`} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6, margin: 0 }}>
        This analysis identifies retirement scenarios where the portfolio was depleted despite near-average
        lifetime market returns. Poor returns in the first decade of retirement — when withdrawals compound
        losses — can deplete savings even when long-term returns recover.
      </p>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 6, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#78350f' }}>{value}</div>
    </div>
  );
}
