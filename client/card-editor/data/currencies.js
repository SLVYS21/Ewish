// Currencies supported for gift attachment.
// Amounts stored as integers (minor units NOT used — kept as base units for simplicity).
export const CURRENCIES = [
  { key: 'XOF', label: 'FCFA', symbol: 'F',  step: 500, min: 500,    max: 500000, presets: [1000, 5000, 10000, 25000, 50000] },
  { key: 'EUR', label: 'EUR',  symbol: '€',  step: 1,   min: 1,      max: 1000,   presets: [5, 10, 20, 50, 100] },
  { key: 'USD', label: 'USD',  symbol: '$',  step: 1,   min: 1,      max: 1000,   presets: [5, 10, 20, 50, 100] },
];

export const findCurrency = (key) => CURRENCIES.find(c => c.key === key) || CURRENCIES[0];

export const formatAmount = (amount, currencyKey) => {
  const c = findCurrency(currencyKey);
  const n = Number(amount) || 0;
  const parts = n.toLocaleString('fr-FR');
  return c.key === 'XOF' ? `${parts} ${c.label}` : `${c.symbol}${parts}`;
};
