import { defaultDelete, defaultSave } from "@/services/default.service";

export const COA_ENDPOINT = "v2/coa";

export const patchCoa = (form) => {
  return defaultSave(COA_ENDPOINT, form);
};
export const deleteCoa = (id) => {
  return defaultDelete(COA_ENDPOINT, id);
};
