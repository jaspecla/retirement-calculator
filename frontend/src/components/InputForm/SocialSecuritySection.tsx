import React from 'react';
import type { SocialSecurityInfo, FilingStatus } from '../../types/simulation';
import { cardStyle, labelStyle, currencyInputStyle, fieldRowStyle, sectionTitleStyle } from './styles';

interface SocialSecuritySectionProps {
  socialSecurity: SocialSecurityInfo;
  spouseSocialSecurity?: SocialSecurityInfo;
  filingStatus: FilingStatus;
  onChange: (ss: SocialSecurityInfo) => void;
  onSpouseChange?: (ss: SocialSecurityInfo) => void;
}

const FRA = 67;

function getClaimingAdjustmentLabel(age: number): string {
  if (age < FRA) {
    const monthsEarly = (FRA - age) * 12;
    // Reduction is ~6.67% per year for first 3 years, 5% per year after
    const reductionMonths36 = Math.min(monthsEarly, 36);
    const reductionMonthsOver36 = Math.max(monthsEarly - 36, 0);
    const reduction = (reductionMonths36 * 5 / 9 + reductionMonthsOver36 * 5 / 12);
    return `−${reduction.toFixed(1)}% from FRA`;
  } else if (age > FRA) {
    const increase = (age - FRA) * 8;
    return `+${increase}% from FRA`;
  }
  return 'Full Retirement Age';
}

const SocialSecurityFields: React.FC<{
  label: string;
  info: SocialSecurityInfo;
  onChange: (ss: SocialSecurityInfo) => void;
}> = ({ label, info, onChange }) => (
  <div style={{ marginBottom: 16 }}>
    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#444' }}>{label}</h3>

    <div style={fieldRowStyle}>
      <label style={labelStyle}>
        Claiming Age: <strong>{info.claimingAge}</strong>
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: '#888' }}>62</span>
        <input
          type="range"
          min={62}
          max={70}
          value={info.claimingAge}
          onChange={(e) => onChange({ ...info, claimingAge: Number(e.target.value) })}
          style={{ flex: 1, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 13, color: '#888' }}>70</span>
      </div>
      <span style={{
        fontSize: 13,
        color: info.claimingAge < FRA ? '#c0392b' : info.claimingAge > FRA ? '#27ae60' : '#666',
        fontWeight: 500,
      }}>
        {getClaimingAdjustmentLabel(info.claimingAge)}
      </span>
    </div>

    <div style={fieldRowStyle}>
      <label style={labelStyle}>Estimated Monthly Benefit at FRA</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>$</span>
        <input
          type="number"
          style={currencyInputStyle}
          value={info.estimatedMonthlyBenefit}
          min={0}
          onChange={(e) => onChange({ ...info, estimatedMonthlyBenefit: Number(e.target.value) })}
        />
      </div>
      <a
        href="https://www.ssa.gov/myaccount/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 13, color: '#2980b9' }}
      >
        Find your estimate at ssa.gov
      </a>
    </div>
  </div>
);

const SocialSecuritySection: React.FC<SocialSecuritySectionProps> = ({
  socialSecurity,
  spouseSocialSecurity,
  filingStatus,
  onChange,
  onSpouseChange,
}) => {
  const isMFJ = filingStatus === 'MarriedFilingJointly';

  return (
    <div style={cardStyle}>
      <h2 style={sectionTitleStyle}>Social Security</h2>

      <SocialSecurityFields
        label={isMFJ ? 'Your Benefits' : 'Your Benefits'}
        info={socialSecurity}
        onChange={onChange}
      />

      {isMFJ && spouseSocialSecurity && onSpouseChange && (
        <>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '16px 0' }} />
          <SocialSecurityFields
            label="Spouse Benefits"
            info={spouseSocialSecurity}
            onChange={onSpouseChange}
          />
        </>
      )}
    </div>
  );
};

export default SocialSecuritySection;
