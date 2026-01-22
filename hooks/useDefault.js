import { useClientFetch } from "@/app/utils/apiconfig";
import { useMemo } from "react";

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
      { key: "lastupdate", label: "Terakhir Diubah" },
    ],
    [isHighRole],
  );
}
