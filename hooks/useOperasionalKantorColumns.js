import { useMemo } from "react";

export default function useOperasionalKantorColumns(isHighRole) {
  return useMemo(() => {
    return [
      {
        key: "aksi",
        label: "Aksi",
      },
      {
        key: "perusahaan",
        label: "Perusahaan",
      },
      {
        key: "tanggal",
        label: "Tanggal",
      },
      {
        key: "karyawan",
        label: "Diinput Oleh",
      },
      {
        key: "kategori",
        label: "Kategori",
      },
      {
        key: "keterangan",
        label: "Keterangan",
      },
      {
        key: "biaya",
        label: "Biaya",
      },
      {
        key: "metodepembayaran",
        label: "Metode Pembayaran",
      },
    ];
  }, [isHighRole]);
}
