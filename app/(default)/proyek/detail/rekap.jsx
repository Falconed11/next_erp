import Harga from '@/components/harga'

const createRecapTable = (rekap, diskon, pajakPersen, pajak = 0, level) => {
  const tableData = [
    ...(level > 1
      ? []
      : [{ key: "Sub Total Modal", val: rekap.modal, info: null }]),
    { key: "Sub Total Harga", val: rekap.jual, info: null },
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
          <div className="basis-1/2-">{v.key}</div>
          <div className="basis-1/2- text-right">
            {v.info ? `(${v.info}%) ` : ""}
            <Harga harga={v.val} />
          </div>
        </div>
      ))}
    </div>
  );
};

export { createRecapTable, RecapTable };
