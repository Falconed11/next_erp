import { defaultDelete, defaultSave } from "./default.service";

export const PERUSAHAAN_ENDPOINT = "perusahaan";

export const savePerusahaan = (form) => {
  return defaultSave(PERUSAHAAN_ENDPOINT, form);
};
export const deletePerusahaan = (id) => {
  return defaultDelete(PERUSAHAAN_ENDPOINT, id);
};
