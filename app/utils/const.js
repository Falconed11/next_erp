import { getApiPath } from "./apiconfig";
import { getNextDomain } from "./tools";
import { apiFetch } from "./fetchHelper";

export const api_path = getApiPath();

export const updateSwitch = async (
  switchValue,
  currentValue,
  apiEndPoint,
  method,
  data,
  referenceData,
) => {
  if (switchValue === currentValue) return;
  const res = await apiFetch(`${api_path}${apiEndPoint}`, {
    method,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json();
    return alert(json.message || "Update failed");
  }
  referenceData.forEach((data) => data.mutate());
};

export const LIST_SWASTA_NEGRI = [
  { id: 1, nama: "swasta" },
  { id: 0, nama: "negri" },
];
export const NEXT_DOMAIN = getNextDomain();
export const TITLE_STYLE = "text-lg font-bold";
export const headers = {
  "Content-Type": "application/json",
};
