import { defaultDelete, defaultSave } from "./default.service";

export const TRANSFER_BANK_ENDPOINT = "v2/transfer-bank";

export const saveTransferBank = (form, id_karyawan) => {
  return defaultSave(TRANSFER_BANK_ENDPOINT, {
    ...form,
    ...(form.method == "POST"
      ? { created_by: id_karyawan }
      : { updated_by: id_karyawan }),
  });
};
export const deleteTransferBank = (id) => {
  return defaultDelete(TRANSFER_BANK_ENDPOINT, id);
};
