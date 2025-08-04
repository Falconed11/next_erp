import Harga from "@/components/harga";

const createRecapTable = (rekap, diskon, pajakPersen, pajak = 0, level) => {
  const isHargaFinal = !(diskon + pajakPersen + pajak);
  const tableData = [
    ...(level > 1
      ? []
      : [
          {
            key: `${level == 1 ? "" : "Sub Total"} Modal`,
            val: rekap.modal,
            info: null,
          },
        ]),
    {
      key: `${
        diskon + pajakPersen + pajak || !(level == 1) ? "Sub Total " : ""
      }Harga`,
      val: rekap.jual,
      info: null,
      classNames: `${isHargaFinal && level ? "font-bold" : ""}`,
    },
    ...(level
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
            key: `Pajak${level ? " Peralatan" : ""}`,
            val: rekap.pajak,
            info: pajak ? null : pajakPersen,
          },
          {
            key: "Harga Setelah Pajak",
            val: pajak ? rekap.hargaDiskon + pajak : rekap.hargaPajak,
            info: null,
          },
        ]
      : []),
    ...(level > 1
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
