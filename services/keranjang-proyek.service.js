import { defaultDelete, defaultSave } from "./default.service";

export const KERANJANG_PROYEK_ENDPOINT_v1 = "keranjangproyek";
export const KERANJANG_PROYEK_ENDPOINT_v2 = "v2/keranjang-proyek";

export const saveKeranjangProyek = (form) => {
  return defaultSave(KERANJANG_PROYEK_ENDPOINT_v1, form);
};
export const deleteKeranjangProyek = (id) => {
  return defaultDelete(KERANJANG_PROYEK_ENDPOINT_v1, id);
};
