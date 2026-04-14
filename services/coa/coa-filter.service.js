import { defaultDelete, defaultSave } from "@/services/default.service";

export const COA_FILTER_ENDPOINT = "v2/coa-filter";

export const patchCoaFilter = (form) => {
  return defaultSave(COA_FILTER_ENDPOINT, form);
};

export const deleteCoaFilter = (id) => {
  return defaultDelete(COA_FILTER_ENDPOINT, id);
};
