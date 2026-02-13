import { useMemo } from "react";
import { OPERASIONAL_KANTOR_ENDPOINT } from "@/services/operasional-kantor.service";
import { useDefaultSumFetch } from "./useDefault";
import { useClientFetchNoInterval } from "./useClientFetch";
import { urlBuilder } from "@/app/utils/tools";

export function useSumOperasionalKantor({
  periode,
  aggregate = null,
  groupBy = null,
  id_perusahaan,
}) {
  return useDefaultSumFetch({
    endPoint: OPERASIONAL_KANTOR_ENDPOINT,
    periode,
    aggregate,
    groupBy,
    id_perusahaan,
  });
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

export const useOperasionalKantor = (periode, id_perusahaan) =>
  useClientFetchNoInterval(
    urlBuilder(OPERASIONAL_KANTOR_ENDPOINT, [
      { key: "periode", val: periode },
      { key: "idPerusahaan", val: id_perusahaan },
    ]),
  );
