import { useMemo } from "react";
import { useClientFetch } from "./useClientFetch";

export function useDefaultFetch({ endPoint, limit, offset }) {
  return useClientFetch(
    `${endPoint}?${limit != null && offset != null ? `limit=${limit}&offset=${offset}` : ""}`,
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
