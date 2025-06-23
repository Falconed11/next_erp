const countProvitMarginPercent = (hargamodal, hargajual) => {
  return ((hargajual - hargamodal) / hargajual) * 100;
  return Math.round(((hargajual - hargamodal) / hargajual) * 100 * 100) / 100;
};
const countPriceByProvitMarginPercent = (hargaModal, provitMarginPercent) => {
  return Math.ceil(hargaModal / (1 - provitMarginPercent / 100));
};
const countPercentProvit = (hargaModal, hargaJual) => {
  return ((hargaJual - hargaModal) / hargaModal) * 100;
};
const countPriceByPercentProfit = (hargaModal, provitPercent) => {
  return hargaModal * (1 + provitPercent / 100);
};

export {
  countProvitMarginPercent,
  countPriceByProvitMarginPercent,
  countPercentProvit,
  countPriceByPercentProfit,
};
