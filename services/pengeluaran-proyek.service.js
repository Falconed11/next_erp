import { defaultDelete, defaultSave } from "./default.service";

export const PENGELUARAN_PROYEK_ENDPOINT = "v2/pengeluaran-proyek";

export const saveOperasionalKantor = (form) => {
  return defaultSave(PENGELUARAN_PROYEK_ENDPOINT, form);
};
export const deleteOperasionalKantor = (id) => {
  return defaultDelete(PENGELUARAN_PROYEK_ENDPOINT, id);
};
