export const CURRENCY_SYMBOLS = {
  QAR: "ر.ق",
  SAR: "ر.س",
  AED: "د.إ",
  KWD: "د.ك",
  BHD: "د.ب",
  OMR: "ر.ع",
  JOD: "د.ا",
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export const getCurrencySymbol = (currency = "QAR") => {
  return CURRENCY_SYMBOLS[currency] || currency;
};

export const formatPrice = (
  amount,
  currency = "QAR",
  decimals = 2
) => {

  const symbol =
    getCurrencySymbol(currency);

  const value =
    Number(amount || 0).toFixed(decimals);

  return `${symbol} ${value}`;
};