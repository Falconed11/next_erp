import { defaultDelete, defaultSave } from "@/services/default.service";

export const COA_FILTER_MAP_ENDPOINT = "v2/coa-filter-map";

export const patchCoaFilterMap = (form) => {
  return defaultSave(COA_FILTER_MAP_ENDPOINT, form);
};

export const deleteCoaFilterMap = (id) => {
  return defaultDelete(COA_FILTER_MAP_ENDPOINT, id);
};
