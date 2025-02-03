import * as XLSX from "xlsx";

const export2excel = (data, name) => {
  // if (selectedKeys.size == 0) return alert("Proyek belum dipilih");
  // const data = penawaran.data.filter((v) =>
  //   selectedKeys.has(String(v.id_proyek))
  // );
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
  XLSX.writeFile(workbook, `${name}.xlsx`, {
    compression: true,
  });
};

export { export2excel };
