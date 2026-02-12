import { useMemo } from "react";
import { OPERASIONAL_KANTOR_ENDPOINT } from "@/services/operasional-kantor.service";
import { useDefaultSumFetch } from "./useDefault";
import { useClientFetchNoInterval } from "./useClientFetch";

export function useSumOperasionalKantor({
  periode,
  aggregate = null,
  groupBy = null,
}) {
  return useDefaultSumFetch(
    OPERASIONAL_KANTOR_ENDPOINT,
    periode,
    aggregate,
    groupBy,
  );
}

export function useOperasionalKantorColumns(isAuthorized) {
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

export const useOperasionalKantor = (periode) => {
  return useClientFetchNoInterval(
    `${OPERASIONAL_KANTOR_ENDPOINT}?${periode ? `periode=${periode}` : ""}`,
  );
};
