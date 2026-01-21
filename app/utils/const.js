import { getApiPath } from "./apiconfig";
import { getNextDomain } from "./tools";

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
  const res = await fetch(`${api_path}${apiEndPoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  // if (res.status == 400) return alert(json.message);
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
