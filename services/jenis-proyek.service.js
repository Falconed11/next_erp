import { API_PATH } from "@/app/utils/apiconfig";
import { headers } from "@/app/utils/const";
const endPoint = "v2/jenis-proyek";
const fullPath = API_PATH + endPoint;
export function saveJenisProyek(form) {
  if (form.method == "PATCH") fullPath += "/" + form.id;
  return fetch(fullPath, {
    method: form.method,
    headers,
    body: JSON.stringify(form),
  });
}
export function deleteJenisProyek(id) {
  return fetch((fullPath += "/" + id), {
    method: "DELETE",
    headers,
    body: JSON.stringify({ id }),
  });
}
