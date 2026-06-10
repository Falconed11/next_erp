import { API_PATH } from "@/app/utils/apiconfig";
import { apiFetch } from "@/app/utils/fetchHelper";
import { defaultSave, defaultDelete } from "@/services/default.service";

export const LAPORAN_RELATION_ENDPOINT = "v2/laporan-relation";

export const saveLaporanRelation = (form) => {
  return defaultSave(LAPORAN_RELATION_ENDPOINT, form);
};

export const getLaporanRelation = (id) => {
  return apiFetch(`${API_PATH}${LAPORAN_RELATION_ENDPOINT}/${id}`, {
    method: "GET",
  });
};

export const deleteLaporanRelation = (id) => {
  return defaultDelete(LAPORAN_RELATION_ENDPOINT, id);
};
