import { API_PATH } from "@/app/utils/apiconfig";
export function saveStatusProyek(form) {
  return fetch(`${API_PATH}statusproyek`, {
    method: form.method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });
}
export function deleteStatusProyek(id) {
  return fetch(`${API_PATH}statusproyek`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
}
