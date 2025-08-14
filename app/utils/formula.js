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
const countRecapitulation = (
  peralatan,
  instalasi,
  { diskon = 0, diskoninstalasi = 0, pajak = 0 }
) => {
  const countModalJual = (data) =>
    data.reduce(
      (acc, v) => {
        acc.modal += v.hargamodal * v.jumlah;
        acc.jual += v.harga * v.jumlah;
        return acc;
      },
      { modal: 0, jual: 0 }
    );
  const countRekap = ({ modal, jual }, diskon, pajakPersen) => {
    const hargaDiskon = jual - diskon;
    const pajakNominal = hargaDiskon * (pajakPersen / 100);
    const hargaPajak = hargaDiskon + pajakNominal;
    const provit = hargaDiskon - modal;
    return {
      maksDiskon: jual - modal,
      maksDiskonPersen: (((jual - modal) / jual) * 100).toFixed(2),
      hargaDiskon,
      diskonPersen: ((diskon / jual) * 100).toFixed(2),
      pajak: pajakNominal,
      hargaPajak,
      provit,
      provitPersen: countPercentProvit(modal, hargaDiskon).toFixed(2),
    };
  };
  const peralatanTotal = countModalJual(peralatan);
  const instalasiTotal = countModalJual(instalasi);
  const total = {
    modal: peralatanTotal.modal + instalasiTotal.modal,
    jual: peralatanTotal.jual + instalasiTotal.jual,
  };
  const rekapPeralatan = countRekap(peralatanTotal, diskon, pajak);
  const rekapInstalasi = countRekap(instalasiTotal, diskoninstalasi, 0);
  const rekapTotal = Object.fromEntries(
    Object.entries(rekapPeralatan).map(([key, val]) => [
      key,
      val + (rekapInstalasi[key] || 0),
    ])
  );
  rekapTotal.diskonPersen = (
    ((diskon + diskoninstalasi) / total.jual) *
    100
  ).toFixed(2);
  rekapTotal.provitPersen = countPercentProvit(
    total.modal,
    rekapTotal.hargaDiskon
  ).toFixed(2);
  return {
    rekapitulasiPeralatan: {
      ...peralatanTotal,
      ...rekapPeralatan,
    },
    rekapitulasiInstalasi: {
      ...instalasiTotal,
      ...rekapInstalasi,
    },
    rekapitulasiTotal: {
      ...total,
      ...rekapTotal,
      jualPeralatan: rekapPeralatan.hargaPajak,
      jualInstalasi: rekapInstalasi.hargaPajak,
    },
  };
};

export {
  countProvitMarginPercent,
  countPriceByProvitMarginPercent,
  countPercentProvit,
  countPriceByPercentProfit,
  countRecapitulation,
};
