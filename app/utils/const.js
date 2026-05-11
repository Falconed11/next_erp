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
  const json = await apiFetch(`${api_path}${apiEndPoint}`, {
    method,
    body: JSON.stringify(data),
  });
  //return alert(json.message);
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
