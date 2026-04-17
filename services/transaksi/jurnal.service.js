import { API_PATH } from "@/app/utils/apiconfig";
import { defaultDelete, defaultSave } from "@/services/default.service";
import { TRANSAKSI_ENDPOINT } from "../transaksi.service";

export const JURNAL_ENDPOINT = "v2/jurnal";

export const patchJurnal = (form) => {
  return defaultSave(JURNAL_ENDPOINT, form);
};
export const deleteJurnal = (id) => {
  return defaultDelete(JURNAL_ENDPOINT, id);
};
export const fetchJurnalById = (id) =>
  fetch(id ? `${API_PATH}${TRANSAKSI_ENDPOINT}/${id}` : null);
