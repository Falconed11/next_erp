const createRecapTable = (rekap, diskon, pajak, isOffering) => {
  const tableData = [
    ...(isOffering
      ? []
      : [{ key: "Sub Total Modal", val: rekap.modal, info: null }]),
    { key: "Sub Total Harga", val: rekap.jual, info: null },
    {
      key: "Maks Diskon",
      val: rekap.maksDiskon,
      info: rekap.maksDiskonPersen,
    },
  ];
  if (diskon)
    tableData.push(
      {
        key: "Diskon",
        val: diskon,
        info: rekap.diskonPersen,
      },
      {
        key: "Harga Setelah Diskon",
        val: rekap.hargaDiskon,
        info: null,
      }
    );
  if (pajak)
    tableData.push(
      { key: "Pajak", val: rekap.pajak, info: pajak },
      { key: "Harga Setelah Pajak", val: rekap.hargaPajak, info: null }
    );
  tableData.push({
    key: "Estimasi Provit",
    val: rekap.provit,
    info: rekap.provitPersen,
  });
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
