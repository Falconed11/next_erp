import { API_PATH } from "@/app/utils/apiconfig";
import { headers } from "@/app/utils/const";
export function defaultSave(endPoint, form) {
  const { id, method, id_karyawan } = form;
  console.log(form);
  return fetch(`${API_PATH}${endPoint}${method == "PATCH" ? `/${id}` : ""}`, {
    method: method,
    headers,
    body: JSON.stringify({
      ...form,
      ...(method == "PATCH"
        ? { updated_by: id_karyawan }
        : { created_by: id_karyawan }),
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
