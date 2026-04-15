import { defaultDelete, defaultSave } from "./default.service";

export const TRANSAKSI_ENDPOINT = "v2/transaksi";

export const saveTransaksi = (form) => {
  return defaultSave(TRANSAKSI_ENDPOINT, form);
};

export const deleteTransaksi = (id) => {
  return defaultDelete(TRANSAKSI_ENDPOINT, id);
};
