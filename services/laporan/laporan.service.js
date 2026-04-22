import { defaultDelete, defaultSave } from "@/services/default.service";
import { urlBuilder } from "@/app/utils/tools";

export const LAPORAN_ENDPOINT = "v2/laporan";

export const patchLaporan = (form) => {
  return defaultSave(LAPORAN_ENDPOINT, form);
};

export const deleteLaporan = (id) => {
  return defaultDelete(LAPORAN_ENDPOINT, id);
};

export const getTreeLaporanEndpoint = ({
  id,
  from,
  to,
  id_perusahaan,
  fullReport,
}) => {
  if (!id) return null;

  return urlBuilder(`${LAPORAN_ENDPOINT}/${id}`, [
    { key: "type", val: "tree" },
    { key: "from", val: from },
    { key: "to", val: to },
    { key: "id_perusahaan", val: id_perusahaan },
    { key: "fullReport", val: fullReport ? true : null },
  ]);
};
