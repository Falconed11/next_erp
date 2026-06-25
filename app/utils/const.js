import { getApiPath } from "./apiconfig";
import { getNextDomain } from "./tools";
import { apiFetch } from "./fetchHelper";

export const api_path = getApiPath();

export const EXPRESS_PATH = process.env.NEXT_PUBLIC_EXPRESS_PATH;

export const updateSwitch = async (
  switchValue,
  currentValue,
  apiEndPoint,
  method,
  data,
  referenceData,
) => {
  if (switchValue === currentValue) return;
  try {
    const res = await apiFetch(`${api_path}${apiEndPoint}`, {
      method,
      body: JSON.stringify(data),
    });
    referenceData.forEach((data) => data.mutate());
  } catch (error) {
    alert(error?.message || "Gagal memperbarui data!");
  }
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
