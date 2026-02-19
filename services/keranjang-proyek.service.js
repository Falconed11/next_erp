import { defaultDelete, defaultSave } from "./default.service";

export const KERANJANG_PROYEK_ENDPOINT = "v2/keranjang-proyek";

export const saveOperasionalKantor = (form) => {
  return defaultSave(KERANJANG_PROYEK_ENDPOINT, form);
};
export const deleteOperasionalKantor = (id) => {
  return defaultDelete(KERANJANG_PROYEK_ENDPOINT, id);
};
