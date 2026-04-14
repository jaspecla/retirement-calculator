import type { CSSProperties } from 'react';

export const cardStyle: CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  padding: '24px 28px',
  marginBottom: 20,
  backgroundColor: '#fff',
};

export const sectionTitleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  marginTop: 0,
  marginBottom: 16,
  color: '#1a1a2e',
};

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 15,
  fontWeight: 500,
  marginBottom: 6,
  color: '#333',
};

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 15,
  border: '1px solid #bbb',
  borderRadius: 6,
  boxSizing: 'border-box',
  outline: 'none',
  color: '#1a1a2e',
};

export const currencyInputStyle: CSSProperties = {
  ...inputStyle,
  paddingLeft: 24,
};

export const radioGroupStyle: CSSProperties = {
  display: 'flex',
  gap: 20,
  marginTop: 4,
};

export const fieldRowStyle: CSSProperties = {
  marginBottom: 16,
};

export const inlineFieldsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 16,
};

export const buttonStyle: CSSProperties = {
  padding: '10px 20px',
  fontSize: 15,
  fontWeight: 500,
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};
