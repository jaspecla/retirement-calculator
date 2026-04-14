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
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
            gap: 12,
            alignItems: 'end',
            padding: '12px 0',
            borderBottom: index < accounts.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}
        >
          <div>
            {index === 0 && <label style={labelStyle}>Account Name</label>}
            <input
              type="text"
              style={inputStyle}
              placeholder="e.g. My 401(k)"
              value={account.name}
              onChange={(e) => updateAccount(index, { name: e.target.value })}
            />
          </div>
          <div>
            {index === 0 && <label style={labelStyle}>Account Type</label>}
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
          <div>
            {index === 0 && <label style={labelStyle}>Balance</label>}
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
            {index === 0 && <label style={labelStyle}>Annual Contribution</label>}
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
          <button
            type="button"
            onClick={() => removeAccount(index)}
            style={{
              ...buttonStyle,
              backgroundColor: '#fff',
              color: '#dc3545',
              border: '1px solid #dc3545',
              padding: '8px 12px',
              marginBottom: index === 0 ? 0 : undefined,
            }}
            title="Remove account"
          >
            ✕
          </button>
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
