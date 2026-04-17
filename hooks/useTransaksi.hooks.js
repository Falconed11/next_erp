import { useDefaultColumnsV2 } from "./useDefault";

export const useTransaksiColumns = (isHighRole) =>
  useDefaultColumnsV2(
    { key: "id_jurnal", label: "Id Jurnal" },
    isHighRole,
    [
      { key: "coa", label: "COA" },
      { key: "tanggal", label: "Tanggal" },
      { key: "debit", label: "Debit" },
      { key: "kredit", label: "Kredit" },
      { key: "perusahaan", label: "Perusahaan" },
    ],
    true,
  );
