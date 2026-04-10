import { defaultDelete, defaultSave } from "@/services/default.service";

export const PERISTIWA_COA_MAP_ENDPOINT = "v2/peristiwa-coa-map";

export const patchPeristiwaCoaMap = (form) => {
  return defaultSave(PERISTIWA_COA_MAP_ENDPOINT, form);
};
export const deletePeristiwaCoaMap = (id) => {
  return defaultDelete(PERISTIWA_COA_MAP_ENDPOINT, id);
};