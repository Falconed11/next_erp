const countProvitMarginPercent = (hargamodal, hargajual) => {
  return Math.round(((hargajual - hargamodal) / hargajual) * 100 * 100) / 100;
};

export { countProvitMarginPercent };
