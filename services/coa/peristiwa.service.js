import { defaultDelete, defaultSave } from "@/services/default.service";

export const PERISTIWA_ENDPOINT = "v2/peristiwa";

export const patchPeristiwa = (form) => {
  return defaultSave(PERISTIWA_ENDPOINT, form);
};
export const deletePeristiwa = (id) => {
  return defaultDelete(PERISTIWA_ENDPOINT, id);
};
