import { useDefaultColumnsV2 } from "./useDefault";

export const useTransaksiColumns = (isHighRole) =>
  useDefaultColumnsV2(
    { key: "id_jurnal", label: "Id Jurnal" },
    isHighRole,
    [
      { key: "tanggal", label: "Tanggal" },
      { key: "keterangan_jurnal", label: "Jurnal" },
      { key: "coa", label: "COA" },
      { key: "debit", label: "Debit" },
      { key: "kredit", label: "Kredit" },
      { key: "perusahaan", label: "Perusahaan" },
    ],
    true,
  );
