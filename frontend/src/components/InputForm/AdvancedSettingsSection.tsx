import React, { useState } from 'react';
import type { SimulationRequest } from '../../types/simulation';
import { cardStyle, labelStyle, inputStyle, fieldRowStyle, sectionTitleStyle, inlineFieldsStyle } from './styles';

interface AdvancedSettingsSectionProps {
  request: SimulationRequest;
  onChange: (updates: Partial<SimulationRequest>) => void;
}

const AdvancedSettingsSection: React.FC<AdvancedSettingsSectionProps> = ({ request, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={cardStyle}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 0,
          width: '100%',
        }}
      >
        <span style={{ fontSize: 14, transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
        <h2 style={{ ...sectionTitleStyle, marginBottom: 0 }}>Advanced Settings</h2>
      </button>

      {isOpen && (
        <div style={{ marginTop: 16 }}>
          <div style={inlineFieldsStyle}>
            <div style={fieldRowStyle}>
              <label style={labelStyle}>Inflation Rate</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  style={{ ...inputStyle, paddingRight: 30 }}
                  value={parseFloat((request.inflationRate * 100).toFixed(2))}
                  min={0}
                  max={20}
                  step={0.1}
                  onChange={(e) => onChange({ inflationRate: Number(e.target.value) / 100 })}
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>%</span>
              </div>
            </div>

            <div style={fieldRowStyle}>
              <label style={labelStyle}>Market Return Mean</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  style={{ ...inputStyle, paddingRight: 30 }}
                  value={parseFloat((request.marketReturn.mean * 100).toFixed(2))}
                  min={-20}
                  max={30}
                  step={0.5}
                  onChange={(e) =>
                    onChange({ marketReturn: { ...request.marketReturn, mean: Number(e.target.value) / 100 } })
                  }
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>%</span>
              </div>
            </div>

            <div style={fieldRowStyle}>
              <label style={labelStyle}>Market Return Std Deviation</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  style={{ ...inputStyle, paddingRight: 30 }}
                  value={parseFloat((request.marketReturn.standardDeviation * 100).toFixed(2))}
                  min={0}
                  max={50}
                  step={0.5}
                  onChange={(e) =>
                    onChange({ marketReturn: { ...request.marketReturn, standardDeviation: Number(e.target.value) / 100 } })
                  }
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>%</span>
              </div>
            </div>

            <div style={fieldRowStyle}>
              <label style={labelStyle}>Simulation Iterations</label>
              <input
                type="number"
                style={inputStyle}
                value={request.simulationIterations}
                min={100}
                max={100000}
                step={500}
                onChange={(e) => onChange({ simulationIterations: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{
            marginTop: 12,
            padding: '10px 14px',
            backgroundColor: '#f8f9fa',
            borderRadius: 6,
            fontSize: 13,
            color: '#666',
            lineHeight: 1.5,
          }}>
            ℹ️ Defaults based on historical S&amp;P 500 returns.
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettingsSection;
