import { defaultDelete, defaultSave } from "./default.service";

export const PEMBAYARAN_PROYEK_ENDPOINT = "v2/pembayaran-proyek";

export const saveOperasionalKantor = (form) => {
  return defaultSave(PEMBAYARAN_PROYEK_ENDPOINT, form);
};
export const deleteOperasionalKantor = (id) => {
  return defaultDelete(PEMBAYARAN_PROYEK_ENDPOINT, id);
};
