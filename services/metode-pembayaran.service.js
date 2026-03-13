import { defaultDelete, defaultSave } from "./default.service";

export const METODE_PEMBAYARAN_ENDPOINT = "metodepembayaran";
export const METODE_PEMBAYARAN_ENDPOINT_V2 = "v2/metode-pembayaran";

export const saveMetodePembayaran = (form) => {
  return defaultSave(METODE_PEMBAYARAN_ENDPOINT, form);
};
export const saveMetodePembayaranV2 = (form) => {
  return defaultSave(METODE_PEMBAYARAN_ENDPOINT_V2, form);
};
export const deleteMetodePembayaran = (id) => {
  return defaultDelete(METODE_PEMBAYARAN_ENDPOINT, id);
};
