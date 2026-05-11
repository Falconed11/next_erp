import { API_PATH } from "@/app/utils/apiconfig";
import { apiFetch } from "@/app/utils/fetchHelper";
export function saveStatusProyek(form) {
  return apiFetch(`${API_PATH}statusproyek`, {
    method: form.method,
    body: JSON.stringify(form),
  });
}
export function deleteStatusProyek(id) {
  return apiFetch(`${API_PATH}statusproyek`, {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}
