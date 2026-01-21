import { useMemo } from "react";

export const useStatusProyekColumns = (isHighRole) =>
  useMemo(() => {
    return [
      ...(isHighRole ? [{ key: "aksi", label: "Aksi" }] : []),
      { key: "id", label: "Id" },
      { key: "nama", label: "Status" },
      { key: "progress", label: "Progress (%)" },
      { key: "nproyek", label: "Jumlah Proyek" },
    ];
  }, [isHighRole]);
