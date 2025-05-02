const countProvitMarginPercent = (hargamodal, hargajual) => {
  return ((hargajual - hargamodal) / hargajual) * 100;
  return Math.round(((hargajual - hargamodal) / hargajual) * 100 * 100) / 100;
};

export { countProvitMarginPercent };
