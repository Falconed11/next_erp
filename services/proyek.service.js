import { defaultDelete, defaultSave } from "./default.service";
import { API_PATH } from "@/app/utils/apiconfig";
import { headers } from "@/app/utils/const";

export const PROYEK_ENDPOINT = "v2/proyek";

export const saveProyek = (form) => {
  return defaultSave(PROYEK_ENDPOINT, form);
};
export const deleteProyek = (id) => {
  return defaultDelete(PROYEK_ENDPOINT, id);
};
export const duplicateProyek = (id) => {
  return fetch(`${API_PATH}${PROYEK_ENDPOINT}/${id}/duplicate`, {
    method: "POST",
    headers,
  });
};
