import { useMemo } from "react";
import { PEMBAYARAN_PROYEK_ENDPOINT } from "@/services/pembayaran-proyek.service";
import { useDefaultSumFetch } from "./useDefault";

export function useSumPembayaranProyek(periode, aggregate) {
  return useDefaultSumFetch(PEMBAYARAN_PROYEK_ENDPOINT, periode, aggregate);
}

export function usePembayaranProyekColumns(isAuthorized) {
  return useMemo(
    () => [
      ...(isAuthorized ? [{ key: "aksi", label: "Aksi" }] : []),
      { key: "metodepembayaranasal", label: "Asal" },
      { key: "metodepembayarantujuan", label: "Tujuan" },
      { key: "nominal", label: "Nominal" },
      { key: "keterangan", label: "Keterangan" },
      { key: "created_at", label: "Tanggal Dibuat" },
      { key: "pembuat", label: "User Pembuat" },
      { key: "updated_at", label: "Terakhir Diubah" },
      { key: "pengedit", label: "User Terakhir" },
    ],
    [isAuthorized],
  );
}
