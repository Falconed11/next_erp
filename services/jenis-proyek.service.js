import { defaultDelete, defaultSave } from "./default.service";

const endPoint = "v2/jenis-proyek";

export const saveJenisProyek = (form) => {
  return defaultSave(endPoint, form);
};
export const deleteJenisProyek = (id) => {
  return defaultDelete(endPoint, id);
};
