import React, { useState } from 'react';
import type { SimulationRequest, SocialSecurityInfo } from '../../types/simulation';
import { DEFAULT_REQUEST } from '../../types/simulation';
import PersonalInfoSection from './PersonalInfoSection';
import AccountsSection from './AccountsSection';
import SocialSecuritySection from './SocialSecuritySection';
import HealthInsuranceSection from './HealthInsuranceSection';
import AdvancedSettingsSection from './AdvancedSettingsSection';

interface InputFormProps {
  onSubmit: (request: SimulationRequest) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [request, setRequest] = useState<SimulationRequest>({ ...DEFAULT_REQUEST });

  const handleChange = (updates: Partial<SimulationRequest>) => {
    setRequest((prev) => ({ ...prev, ...updates }));
  };

  const handleSpouseSocialSecurityChange = (ss: SocialSecurityInfo) => {
    setRequest((prev) => ({ ...prev, spouseSocialSecurity: ss }));
  };

  const handleFilingStatusChange = (updates: Partial<SimulationRequest>) => {
    setRequest((prev) => {
      const next = { ...prev, ...updates };
      // Initialize spouse SS when switching to MFJ
      if (next.filingStatus === 'MarriedFilingJointly' && !next.spouseSocialSecurity) {
        next.spouseSocialSecurity = { claimingAge: 67, estimatedMonthlyBenefit: 0 };
      }
      // Clear spouse SS when switching to Single
      if (next.filingStatus === 'Single') {
        next.spouseSocialSecurity = undefined;
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(request);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 800, margin: '0 auto' }}>
      <PersonalInfoSection request={request} onChange={handleFilingStatusChange} />

      <AccountsSection
        accounts={request.accounts}
        onChange={(accounts) => handleChange({ accounts })}
      />

      <SocialSecuritySection
        socialSecurity={request.socialSecurity}
        spouseSocialSecurity={request.spouseSocialSecurity}
        filingStatus={request.filingStatus}
        onChange={(ss) => handleChange({ socialSecurity: ss })}
        onSpouseChange={handleSpouseSocialSecurityChange}
      />

      <HealthInsuranceSection
        healthInsurance={request.healthInsurance}
        onChange={(hi) => handleChange({ healthInsurance: hi })}
      />

      <AdvancedSettingsSection request={request} onChange={handleChange} />

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '14px 24px',
          fontSize: 16,
          fontWeight: 600,
          color: '#fff',
          backgroundColor: isLoading ? '#93b8d7' : '#2563eb',
          border: 'none',
          borderRadius: 8,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          marginBottom: 40,
        }}
      >
        {isLoading ? '⏳ Running Simulation…' : 'Run Simulation'}
      </button>
    </form>
  );
};

export default InputForm;
