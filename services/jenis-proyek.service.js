import { defaultDelete, defaultSave } from "./default.service";

export const JENIS_PROYEK_ENDPOINT = "v2/jenis-proyek";

export const saveJenisProyek = (form) => {
  return defaultSave(JENIS_PROYEK_ENDPOINT, form);
};
export const deleteJenisProyek = (id) => {
  return defaultDelete(JENIS_PROYEK_ENDPOINT, id);
};
