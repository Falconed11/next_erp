import { useMemo } from "react";
import { useClientFetch, useClientFetchNoInterval } from "./useClientFetch";
import { urlBuilder } from "@/app/utils/tools";

export function useDefaultFetch({ endPoint, limit, offset, noInterval }) {
  const qPagination = `limit=${limit}&offset=${offset}`;
  if (noInterval)
    return useClientFetchNoInterval(
      `${endPoint}?${limit != null && offset != null ? qPagination : ""}`,
    );
  return useClientFetch(
    `${endPoint}?${limit != null && offset != null ? qPagination : ""}`,
  );
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

export function useDefaultColumns(isHighRole) {
  return useMemo(
    () => [
      ...(isHighRole ? [{ key: "aksi", label: "Aksi" }] : []),
      { key: "id", label: "Id" },
      { key: "nama", label: "Nama" },
      { key: "keterangan", label: "Keterangan" },
      { key: "creationdate", label: "Tanggal Dibuat" },
      { key: "authorid_karyawan", label: "User Pembuat" },
      { key: "lastupdate", label: "Terakhir Diubah" },
      { key: "lastid_karyawan", label: "User Terakhir" },
    ],
    [isHighRole],
  );
}
