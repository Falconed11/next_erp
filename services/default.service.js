import { API_PATH } from "@/app/utils/apiconfig";
import { headers } from "@/app/utils/const";
import { apiFetch } from "@/app/utils/fetchHelper";
export function defaultSave(endPoint, form) {
  const { id, method, sessIdKaryawan } = form;
  console.log(form);
  return apiFetch(
    `${API_PATH}${endPoint}${["PATCH", "PUT"].includes(method) ? `/${id}` : ""}`,
    {
      method: method,
      body: JSON.stringify({
        ...form,
        ...(["PATCH", "PUT"].includes(method)
          ? { updated_by: sessIdKaryawan }
          : { created_by: sessIdKaryawan }),
      }),
    },
  );
}
export function defaultDelete(endPoint, id) {
  return apiFetch(`${API_PATH}${endPoint}/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}
