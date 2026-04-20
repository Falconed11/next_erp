import { defaultDelete, defaultSave } from "@/services/default.service";

export const LAPORAN_ENDPOINT = "v2/laporan";

export const patchLaporan = (form) => {
  return defaultSave(LAPORAN_ENDPOINT, form);
};

export const deleteLaporan = (id) => {
  return defaultDelete(LAPORAN_ENDPOINT, id);
};
