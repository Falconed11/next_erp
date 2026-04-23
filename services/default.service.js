import { API_PATH } from "@/app/utils/apiconfig";
import { headers } from "@/app/utils/const";
export function defaultSave(endPoint, form) {
  const { id, method, sessIdKaryawan } = form;
  console.log(form);
  return fetch(`${API_PATH}${endPoint}${method == "PATCH" ? `/${id}` : ""}`, {
    method: method,
    headers,
    body: JSON.stringify({
      ...form,
      ...(method == "PATCH"
        ? { updated_by: sessIdKaryawan }
        : { created_by: sessIdKaryawan }),
    }),
  });
}
export function defaultDelete(endPoint, id) {
  return fetch(`${API_PATH}${endPoint}/${id}`, {
    method: "DELETE",
    headers,
    // body: JSON.stringify({ id }),
  });
}
