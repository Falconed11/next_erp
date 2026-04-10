import { useMemo } from "react";
import { useClientFetch, useClientFetchNoInterval } from "./useClientFetch";
import { urlBuilder } from "@/app/utils/tools";

export function useDefaultFetch({
  endPoint,
  limit,
  offset,
  noInterval,
  filter,
}) {
  const isPagination = limit != null && offset != null;
  const qPagination = `limit=${limit}&offset=${offset}`;
  const finalEndPoint = `${endPoint}?${isPagination ? qPagination : ""}&${filter}`;
  if (noInterval) return useClientFetchNoInterval(finalEndPoint);
  return useClientFetch(finalEndPoint);
}

export function useDefaultSumFetch({
  endPoint,
  periode,
  aggregate,
  groupBy,
  id_perusahaan,
}) {
  return useClientFetchNoInterval(
    urlBuilder(endPoint, [
      { key: "periode", val: periode },
      { key: "aggregate", val: aggregate },
      { key: "groupBy", val: groupBy },
      { key: "idPerusahaan", val: id_perusahaan },
    ]),
  );
}

export function useDefaultColumns(
  isHighRole,
  extraColumns = [],
  disableNama = false,
) {
  return useMemo(
    () => [
      ...(isHighRole ? [{ key: "aksi", label: "Aksi" }] : []),
      { key: "id", label: "Id" },
      ...(!disableNama ? [{ key: "nama", label: "Nama" }] : []),
      ...extraColumns,
      { key: "keterangan", label: "Keterangan" },
      { key: "creationdate", label: "Tanggal Dibuat" },
      { key: "created_by", label: "Pembuat" },
      { key: "lastupdate", label: "Terakhir Diubah" },
      { key: "updated_by", label: "Pengubah" },
    ],
    [isHighRole, disableNama],
  );
}
