export const formatIndianCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    amount = 0;
  }
  
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
