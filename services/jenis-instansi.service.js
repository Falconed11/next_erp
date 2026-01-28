import { defaultDelete, defaultSave } from "./default.service";

export const JENIS_INSTANSI_ENDPOINT = "v2/jenis-instansi";

export const saveJenisInstansi = (form) => {
  return defaultSave(JENIS_INSTANSI_ENDPOINT, form);
};
export const deleteJenisInstansi = (id) => {
  return defaultDelete(JENIS_INSTANSI_ENDPOINT, id);
};
