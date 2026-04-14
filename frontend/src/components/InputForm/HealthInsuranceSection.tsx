import React from 'react';
import type { HealthInsuranceInfo } from '../../types/simulation';
import { cardStyle, labelStyle, currencyInputStyle, inputStyle, fieldRowStyle, sectionTitleStyle, inlineFieldsStyle } from './styles';

interface HealthInsuranceSectionProps {
  healthInsurance: HealthInsuranceInfo;
  onChange: (hi: HealthInsuranceInfo) => void;
}

const HealthInsuranceSection: React.FC<HealthInsuranceSectionProps> = ({ healthInsurance, onChange }) => {
  return (
    <div style={cardStyle}>
      <h2 style={sectionTitleStyle}>Health Insurance</h2>

      <div style={inlineFieldsStyle}>
        <div style={fieldRowStyle}>
          <label style={labelStyle}>Monthly Premium (Pre-Medicare)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>$</span>
            <input
              type="number"
              style={currencyInputStyle}
              value={healthInsurance.monthlyPremiumPreMedicare}
              min={0}
              onChange={(e) =>
                onChange({ ...healthInsurance, monthlyPremiumPreMedicare: Number(e.target.value) })
              }
            />
          </div>
        </div>

        <div style={fieldRowStyle}>
          <label style={labelStyle}>Expected Annual Increase</label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              style={{ ...inputStyle, paddingRight: 30 }}
              value={parseFloat((healthInsurance.expectedAnnualIncrease * 100).toFixed(2))}
              min={0}
              max={100}
              step={0.5}
              onChange={(e) =>
                onChange({ ...healthInsurance, expectedAnnualIncrease: Number(e.target.value) / 100 })
              }
            />
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>%</span>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 12,
        padding: '10px 14px',
        backgroundColor: '#eef6ff',
        borderRadius: 6,
        fontSize: 14,
        color: '#2c5282',
        lineHeight: 1.5,
      }}>
        ℹ️ Medicare begins at age 65. Post-65 costs are estimated automatically.
      </div>
    </div>
  );
};

export default HealthInsuranceSection;
