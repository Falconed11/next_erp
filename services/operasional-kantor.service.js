import { defaultDelete, defaultSave } from "./default.service";

export const OPERASIONAL_KANTOR_ENDPOINT = "v2/operasional-kantor";

export const saveOperasionalKantor = (form) => {
  return defaultSave(OPERASIONAL_KANTOR_ENDPOINT, form);
};
export const deleteOperasionalKantor = (id) => {
  return defaultDelete(OPERASIONAL_KANTOR_ENDPOINT, id);
};
