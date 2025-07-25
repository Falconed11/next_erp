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
const countRecapitulation = (data, diskon, pajakPersen) => {
  const { modal, jual } = data.reduce(
    ({ modal, jual }, v) => ({
      modal: modal + v.hargamodal * v.jumlah,
      jual: jual + v.harga * v.jumlah,
    }),
    { modal: 0, jual: 0 }
  );
  const maksDiskon = jual - modal;
  const maksDiskonPersen = ((maksDiskon / jual) * 100).toFixed(2);
  const hargaDiskon = jual - diskon;
  const diskonPersen = ((diskon / jual) * 100).toFixed(2);
  const pajak = hargaDiskon * (pajakPersen / 100);
  const hargaPajak = hargaDiskon + pajak;
  const provit = hargaDiskon - modal;
  const provitPersen = countPercentProvit(modal, hargaDiskon).toFixed(2);
  return {
    modal,
    jual,
    maksDiskon,
    maksDiskonPersen,
    hargaDiskon,
    diskonPersen,
    pajak,
    hargaPajak,
    provit,
    provitPersen,
  };
};

export {
  countProvitMarginPercent,
  countPriceByProvitMarginPercent,
  countPercentProvit,
  countPriceByPercentProfit,
  countRecapitulation,
};
