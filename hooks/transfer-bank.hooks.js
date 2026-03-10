import { useMemo } from "react";
import { TRANSFER_BANK_ENDPOINT } from "../services/transfer-bank.service";
import { useClientFetch } from "./useClientFetch";

export function useTransferBankFetch({ limit, offset }) {
  return useClientFetch(
    `${TRANSFER_BANK_ENDPOINT}?${limit != null && offset != null ? `limit=${limit}&offset=${offset}` : ""}`,
  );
}

export function useTransferBankColumns(isAuthorized) {
  return useMemo(
    () => [
      ...(isAuthorized ? [{ key: "aksi", label: "Aksi" }] : []),
      { key: "tanggal", label: "Tanggal Transaksi" },
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
