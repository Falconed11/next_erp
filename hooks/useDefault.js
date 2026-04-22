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
  if (!endPoint) {
    return noInterval ? useClientFetchNoInterval(null) : useClientFetch(null);
  }

  const isPagination = limit != null && offset != null;
  const qPagination = isPagination ? `limit=${limit}&offset=${offset}` : "";
  const query = [qPagination, filter].filter(Boolean).join("&");
  const finalEndPoint = query ? `${endPoint}?${query}` : endPoint;

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
export function useDefaultColumnsV2(
  customId = { key: "id", label: "Id" },
  isHighRole,
  extraColumns = [],
  disableNama = false,
) {
  return useMemo(
    () => [
      ...(isHighRole ? [{ key: "aksi", label: "Aksi" }] : []),
      customId,
      ...(!disableNama ? [{ key: "nama", label: "Nama" }] : []),
      ...extraColumns,
      { key: "keterangan", label: "Keterangan" },
      { key: "created_at", label: "Dibuat" },
      { key: "created_by", label: "Pembuat" },
      { key: "updated_at", label: "Diubah" },
      { key: "updated_by", label: "Pengubah" },
    ],
    [isHighRole, disableNama, customId],
  );
}
