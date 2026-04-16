import { defaultDelete, defaultSave } from "@/services/default.service";

export const JURNAL_ENDPOINT = "v2/jurnal";

export const patchJurnal = (form) => {
  return defaultSave(JURNAL_ENDPOINT, form);
};
export const deleteJurnal = (id) => {
  return defaultDelete(JURNAL_ENDPOINT, id);
};
