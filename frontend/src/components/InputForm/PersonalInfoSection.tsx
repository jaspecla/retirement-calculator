import React from 'react';
import type { SimulationRequest, FilingStatus } from '../../types/simulation';
import { cardStyle, labelStyle, inputStyle, currencyInputStyle, radioGroupStyle, fieldRowStyle, sectionTitleStyle, inlineFieldsStyle } from './styles';

interface PersonalInfoSectionProps {
  request: SimulationRequest;
  onChange: (updates: Partial<SimulationRequest>) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ request, onChange }) => {
  const isMFJ = request.filingStatus === 'MarriedFilingJointly';

  const handleFilingStatus = (status: FilingStatus) => {
    const updates: Partial<SimulationRequest> = { filingStatus: status };
    if (status === 'Single') {
      updates.spouseCurrentAge = undefined;
      updates.spouseRetirementAge = undefined;
      updates.spouseLifeExpectancy = undefined;
      updates.spouseAnnualIncome = undefined;
    } else {
      updates.spouseCurrentAge = updates.spouseCurrentAge ?? 35;
      updates.spouseRetirementAge = updates.spouseRetirementAge ?? 65;
      updates.spouseLifeExpectancy = updates.spouseLifeExpectancy ?? 90;
      updates.spouseAnnualIncome = updates.spouseAnnualIncome ?? 0;
    }
    onChange(updates);
  };

  return (
    <div style={cardStyle}>
      <h2 style={sectionTitleStyle}>Personal Information</h2>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Filing Status</label>
        <div style={radioGroupStyle}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="radio"
              name="filingStatus"
              checked={request.filingStatus === 'Single'}
              onChange={() => handleFilingStatus('Single')}
            />
            Single
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="radio"
              name="filingStatus"
              checked={request.filingStatus === 'MarriedFilingJointly'}
              onChange={() => handleFilingStatus('MarriedFilingJointly')}
            />
            Married Filing Jointly
          </label>
        </div>
      </div>

      <div style={inlineFieldsStyle}>
        <div style={fieldRowStyle}>
          <label style={labelStyle}>Current Age</label>
          <input
            type="number"
            style={inputStyle}
            value={request.currentAge}
            min={18}
            max={100}
            onChange={(e) => onChange({ currentAge: Number(e.target.value) })}
          />
        </div>
        <div style={fieldRowStyle}>
          <label style={labelStyle}>Retirement Age</label>
          <input
            type="number"
            style={inputStyle}
            value={request.retirementAge}
            min={18}
            max={100}
            onChange={(e) => onChange({ retirementAge: Number(e.target.value) })}
          />
        </div>
        <div style={fieldRowStyle}>
          <label style={labelStyle}>Life Expectancy</label>
          <input
            type="number"
            style={inputStyle}
            value={request.lifeExpectancy}
            min={50}
            max={120}
            onChange={(e) => onChange({ lifeExpectancy: Number(e.target.value) })}
          />
        </div>
      </div>

      <div style={fieldRowStyle}>
        <label style={labelStyle}>Annual Income</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>$</span>
          <input
            type="number"
            style={currencyInputStyle}
            value={request.annualIncome}
            min={0}
            onChange={(e) => onChange({ annualIncome: Number(e.target.value) })}
          />
        </div>
      </div>

      {isMFJ && (
        <>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12, color: '#1a1a2e' }}>Spouse Information</h3>

          <div style={inlineFieldsStyle}>
            <div style={fieldRowStyle}>
              <label style={labelStyle}>Spouse Current Age</label>
              <input
                type="number"
                style={inputStyle}
                value={request.spouseCurrentAge ?? 35}
                min={18}
                max={100}
                onChange={(e) => onChange({ spouseCurrentAge: Number(e.target.value) })}
              />
            </div>
            <div style={fieldRowStyle}>
              <label style={labelStyle}>Spouse Retirement Age</label>
              <input
                type="number"
                style={inputStyle}
                value={request.spouseRetirementAge ?? 65}
                min={18}
                max={100}
                onChange={(e) => onChange({ spouseRetirementAge: Number(e.target.value) })}
              />
            </div>
            <div style={fieldRowStyle}>
              <label style={labelStyle}>Spouse Life Expectancy</label>
              <input
                type="number"
                style={inputStyle}
                value={request.spouseLifeExpectancy ?? 90}
                min={50}
                max={120}
                onChange={(e) => onChange({ spouseLifeExpectancy: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={fieldRowStyle}>
            <label style={labelStyle}>Spouse Annual Income</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>$</span>
              <input
                type="number"
                style={currencyInputStyle}
                value={request.spouseAnnualIncome ?? 0}
                min={0}
                onChange={(e) => onChange({ spouseAnnualIncome: Number(e.target.value) })}
              />
            </div>
          </div>
        </>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />

      <div style={fieldRowStyle}>
        <label style={labelStyle}>Annual Expenses in Retirement</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>$</span>
          <input
            type="number"
            style={currencyInputStyle}
            value={request.annualExpenses}
            min={0}
            onChange={(e) => onChange({ annualExpenses: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
