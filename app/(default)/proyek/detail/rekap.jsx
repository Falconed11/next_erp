import Harga from "@/components/harga";

const createRecapTable = (
  rekap,
  diskon,
  pajakPersen,
  pajak = 0,
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
            key: `Sub Total Modal`,
            val: rekap.modal,
            info: null,
          },
        ]),
    {
      key: `${
        isHargaFinal ? (isPenawaran ? "Total " : "") : "Sub Total "
      }Harga`,
      val: rekap.jual,
      info: null,
      classNames: `${isHargaFinal ? "font-bold" : ""}`,
    },
    ...(isPenawaran
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
          },
        ]
      : []),
    ...(pajakPersen || pajak
      ? [
          {
            key: `PPn (${pajakPersen}%)`,
            val: rekap.pajak,
          },
          {
            key: "Harga Setelah Pajak",
            val: pajak ? rekap.hargaDiskon + pajak : rekap.hargaPajak,
            info: null,
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

const createRecapTableTotal = (data, isPenawaran) => {
  const tableData = [
    { key: "Peralatan", val: data.jualPeralatan },
    { key: "Instalasi", val: data.jualInstalasi },
    { key: "Grand Total", val: data.hargaPajak, classNames: "font-bold" },
    ...(isPenawaran
      ? []
      : [
          { key: "Modal", val: data.modal },
          { key: "Jual", val: data.hargaDiskon },
          { key: "Estimasi Provit", val: data.provit, info: data.provitPersen },
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

export { createRecapTable, createRecapTableTotal, RecapTable };
