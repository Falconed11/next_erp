import { defaultDelete, defaultSave } from "@/services/default.service";

export const COA_TYPE_ENDPOINT = "v2/coa-type";

export const patchCoaType = (form) => {
  return defaultSave(COA_TYPE_ENDPOINT, form);
};
export const deleteCoaType = (id) => {
  return defaultDelete(COA_TYPE_ENDPOINT, id);
};
