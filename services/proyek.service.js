import { defaultDelete, defaultSave } from "./default.service";

export const PROYEK_ENDPOINT = "v2/proyek";

export const saveProyek = (form) => {
  return defaultSave(PROYEK_ENDPOINT, form);
};
export const deleteProyek = (id) => {
  return defaultDelete(PROYEK_ENDPOINT, id);
};
