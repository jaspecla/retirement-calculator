import type { CSSProperties } from 'react';

export const cardStyle: CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  padding: '20px 24px',
  marginBottom: 20,
  backgroundColor: '#fff',
};

export const sectionTitleStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginTop: 0,
  marginBottom: 16,
  color: '#333',
};

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  marginBottom: 4,
  color: '#555',
};

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  fontSize: 14,
  border: '1px solid #ccc',
  borderRadius: 4,
  boxSizing: 'border-box',
  outline: 'none',
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
  marginBottom: 14,
};

export const inlineFieldsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 16,
};

export const buttonStyle: CSSProperties = {
  padding: '10px 20px',
  fontSize: 14,
  fontWeight: 500,
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};
