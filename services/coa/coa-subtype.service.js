import { defaultDelete, defaultSave } from "@/services/default.service";

export const COA_SUBTYPE_ENDPOINT = "v2/coa-subtype";

export const patchCoaSubType = (form) => {
  return defaultSave(COA_SUBTYPE_ENDPOINT, form);
};
export const deleteCoaSubType = (id) => {
  return defaultDelete(COA_SUBTYPE_ENDPOINT, id);
};
