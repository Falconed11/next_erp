import Harga from "@/components/harga";

const createRecapTable = (
  rekap,
  diskon,
  pajakPersen,
  pajak = 0,
  isTotal,
  isPenawaran
) => {
  const isDiskon = !!diskon;
  const isPajak = !!(pajak + pajakPersen);
  const isHargaFinal = !isDiskon && !isPajak;
  const isDiskonFinal = isDiskon && !isPajak;
  const tableData = [
    ...(isPenawaran
      ? []
      : [
          {
            key: `${isTotal ? "" : "Sub Total"} Modal`,
            val: rekap.modal,
            info: null,
          },
        ]),
    {
      key: `${
        isHargaFinal && isTotal ? (isPenawaran ? "Total " : "") : "Sub Total "
      }Harga`,
      val: rekap.jual,
      info: null,
      classNames: `${isHargaFinal ? "font-bold" : ""}`,
    },
    ...(isTotal || isPenawaran
      ? []
      : [
          {
            key: "Maks Diskon",
            val: rekap.maksDiskon,
            info: rekap.maksDiskonPersen,
          },
        ]),
    ...(diskon
      ? [
          {
            key: "Diskon",
            val: diskon,
            info: rekap.diskonPersen,
          },
          {
            key: "Harga Setelah Diskon",
            val: rekap.hargaDiskon,
            info: null,
            classNames: isDiskonFinal ? "font-bold" : "",
          },
        ]
      : []),
    ...(pajakPersen || pajak
      ? [
          {
            key: `Pajak${isTotal ? " Peralatan" : ""}`,
            val: rekap.pajak,
            info: pajak ? null : pajakPersen,
          },
          {
            key: "Harga Setelah Pajak",
            val: pajak ? rekap.hargaDiskon + pajak : rekap.hargaPajak,
            info: null,
            classNames: "font-bold",
          },
        ]
      : []),
    ...(isPenawaran
      ? []
      : [
          {
            key: "Estimasi Provit",
            val: rekap.provit,
            info: rekap.provitPersen,
          },
        ]),
  ];
  return tableData;
};

const RecapTable = ({ tableData }) => {
  return (
    <div>
      {tableData.map((v, i) => (
        <div key={i} className="grid grid-cols-2">
          <div className={`${v.classNames}`}>{v.key}</div>
          <div className={`text-right ${v.classNames}`}>
            {v.info ? `(${v.info}%) ` : ""}
            <Harga harga={v.val} />
          </div>
        </div>
      ))}
    </div>
  );
};

export { createRecapTable, RecapTable };
