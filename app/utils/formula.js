const countProvitMarginPercent = (hargamodal, hargajual) => {
  return ((hargajual - hargamodal) / hargajual) * 100;
  return Math.round(((hargajual - hargamodal) / hargajual) * 100 * 100) / 100;
};
const countPriceByProvitMarginPercent = (hargaModal, provitMarginPercent) => {
  return Math.ceil(hargaModal / (1 - provitMarginPercent / 100));
};

export { countProvitMarginPercent, countPriceByProvitMarginPercent };
