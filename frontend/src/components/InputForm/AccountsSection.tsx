import React from 'react';
import type { AccountInfo, AccountType } from '../../types/simulation';
import { cardStyle, labelStyle, inputStyle, currencyInputStyle, sectionTitleStyle, buttonStyle } from './styles';

interface AccountsSectionProps {
  accounts: AccountInfo[];
  onChange: (accounts: AccountInfo[]) => void;
}

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  Taxable: 'Taxable Brokerage',
  Traditional401k: 'Traditional 401(k)',
  TraditionalIRA: 'Traditional IRA',
  RothIRA: 'Roth IRA',
  Roth401k: 'Roth 401(k)',
};

const ACCOUNT_TYPES = Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[];

const AccountsSection: React.FC<AccountsSectionProps> = ({ accounts, onChange }) => {
  const updateAccount = (index: number, updates: Partial<AccountInfo>) => {
    const updated = accounts.map((acc, i) => (i === index ? { ...acc, ...updates } : acc));
    onChange(updated);
  };

  const removeAccount = (index: number) => {
    onChange(accounts.filter((_, i) => i !== index));
  };

  const addAccount = () => {
    onChange([...accounts, { name: '', type: 'Taxable', balance: 0, annualContribution: 0 }]);
  };

  return (
    <div style={cardStyle}>
      <h2 style={sectionTitleStyle}>Investment Accounts</h2>

      {accounts.length === 0 && (
        <p style={{ color: '#888', fontStyle: 'italic', marginBottom: 12 }}>
          No accounts added yet. Click "Add Account" to get started.
        </p>
      )}

      {accounts.map((account, index) => (
        <div
          key={index}
          style={{
            padding: '16px',
            marginBottom: 12,
            border: '1px solid #e8e8e8',
            borderRadius: 8,
            backgroundColor: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#666' }}>Account {index + 1}</span>
            <button
              type="button"
              onClick={() => removeAccount(index)}
              style={{
                ...buttonStyle,
                backgroundColor: '#fff',
                color: '#dc3545',
                border: '1px solid #dc3545',
                padding: '4px 10px',
                fontSize: 13,
              }}
              title="Remove account"
            >
              ✕ Remove
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Account Name</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="e.g. My 401(k)"
                value={account.name}
                onChange={(e) => updateAccount(index, { name: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Account Type</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={account.type}
                onChange={(e) => updateAccount(index, { type: e.target.value as AccountType })}
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {ACCOUNT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Balance</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>$</span>
                <input
                  type="number"
                  style={currencyInputStyle}
                  value={account.balance}
                  min={0}
                  onChange={(e) => updateAccount(index, { balance: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Annual Contribution</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>$</span>
                <input
                  type="number"
                  style={currencyInputStyle}
                  value={account.annualContribution}
                  min={0}
                  onChange={(e) => updateAccount(index, { annualContribution: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addAccount}
        style={{
          ...buttonStyle,
          backgroundColor: '#f8f9fa',
          color: '#333',
          border: '1px dashed #ccc',
          width: '100%',
          marginTop: 16,
        }}
      >
        + Add Account
      </button>
    </div>
  );
};

export default AccountsSection;
