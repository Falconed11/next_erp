import { useMemo } from "react";
import { useClientFetch, useClientFetchNoInterval } from "./useClientFetch";
import { OPERASIONAL_KANTOR_ENDPOINT } from "@/services/operasional-kantor.service";

export function useSumOperasionalKantor(periode, aggregate) {
  return useClientFetchNoInterval(
    `${OPERASIONAL_KANTOR_ENDPOINT}?periode=${periode}${aggregate ? `&aggregate=${aggregate}` : ""}`,
  );
}

export function useTransferBankColumns(isAuthorized) {
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
