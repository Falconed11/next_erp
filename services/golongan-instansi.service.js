import { defaultDelete, defaultSave } from "./default.service";

export const GOLONGAN_INSTANSI_ENDPOINT = "v2/golongan-instansi";

export const saveGolonganInstansi = (form) => {
  return defaultSave(GOLONGAN_INSTANSI_ENDPOINT, form);
};
export const deleteGolonganInstansi = (id) => {
  return defaultDelete(GOLONGAN_INSTANSI_ENDPOINT, id);
};
