import { defaultDelete, defaultSave } from "@/services/default.service";

export const PRODUK_ENDPOINT = "v2/produk";

export const patchProduk = (form) => {
  return defaultSave(PRODUK_ENDPOINT, form);
};
export const deleteProduk = (id) => {
  return defaultDelete(PRODUK_ENDPOINT, id);
};
