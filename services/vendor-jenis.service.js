import { defaultDelete, defaultSave } from "./default.service";

export const VENDOR_JENIS_ENDPOINT = "v2/vendor-jenis";

export const saveVendorJenis = (form) => {
  return defaultSave(VENDOR_JENIS_ENDPOINT, form);
};

export const deleteVendorJenis = (id) => {
  return defaultDelete(VENDOR_JENIS_ENDPOINT, id);
};
