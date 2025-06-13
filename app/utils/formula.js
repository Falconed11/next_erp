const countProvitMarginPercent = (hargamodal, hargajual) => {
  return ((hargajual - hargamodal) / hargajual) * 100;
  return Math.round(((hargajual - hargamodal) / hargajual) * 100 * 100) / 100;
};
const countPriceByProvitMarginPercent = (hargaModal, provitMarginPercent) => {
  return hargaModal / (1 - provitMarginPercent);
};

export { countProvitMarginPercent, countPriceByProvitMarginPercent };
