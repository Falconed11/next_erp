import { useEffect, useState } from "react";
import { getApiPath } from "./apiconfig";
const api_path = getApiPath();
export const getNextDomain = () => {
  return process.env.NEXT_PUBLIC_MAIN_URL;
};
export const rolesCheck = (roles, peran) => {
  return roles.includes(peran);
};
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
export const highRoleCheck = (rank) => rank <= 20;
export const key2set = (key) => new Set(key != null ? [String(key)] : []);
export const set2key = (set) => new Set(set).values().next().value || null;
export const capitalizeEachWord = (str = "") => {
  if (!str) return;
  return str.replace(
    /\b\w+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
};
export const renderQueryStates = (queries, session) => {
  for (const [name, data] of Object.entries(queries ?? {})) {
    const error = data.error;
    if (error)
      return (
        <div>
          Failed to load {name} {error.message}
        </div>
      );
    if (data.isLoading) return <div>Loading {name}...</div>;
  }
  if (session?.status === "loading") return <div>Session Loading...</div>;
};
export const useDebounce = (value, delay = 1000) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};
export const conditionalURLParamBuilder = (key, val) =>
  val != null ? `${key}=${val}` : "";
export const paramBuilder = (params = []) =>
  params.length
    ? "?" +
      params
        .flatMap(({ key, val }) =>
          val != null ? [conditionalURLParamBuilder(key, val)] : [],
        )
        .join("&")
    : "";
export const urlBuilder = (endPoint = "", params = []) =>
  `${endPoint}${paramBuilder(params)}`;
export const updateForm = (setForm, data = {}) =>
  setForm((prev) => ({ ...prev, ...data }));
