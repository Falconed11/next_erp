import { useEffect, useState } from "react";
import { getApiPath } from "./apiconfig";
import { produce } from "immer";
import { apiFetch } from "./fetchHelper";
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
  try {
    const res = await apiFetch(`${api_path}${apiEndPoint}`, {
      method,
      body: JSON.stringify(data),
    });
    //return alert(json.message);
    referenceData.forEach((data) => data.mutate());
  } catch (error) {
    alert(error?.message || "Gagal memperbarui data!");
  }
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
export const renderQueryStates = (queries) => {
  const queryArray = Object.entries(queries ?? {});
  for (const [name, res] of queryArray) {
    const { data, error, isLoading } = res;
    const { success, message } = data ?? {};
    if (isLoading) {
      return <div>Loading {name} ...</div>;
    }
    if (error) {
      return (
        <div>
          Failed to load {name}: {error.message}
        </div>
      );
    }
    if (success === false) {
      return (
        <div>
          Fetch failed {name}: {message}
        </div>
      );
    }
  }
  return null;
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
export const updateNestedForm = (setForm, path, value) => {
  setForm((prev) =>
    produce(prev, (draft) => {
      const keys = path.split(".");
      let current = draft;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
          current[key] = isNaN(keys[i + 1]) ? {} : [];
        }
        current = current[key];
      }
      current[keys[keys.length - 1]] = value;
    }),
  );
};
export const buildURLPathQuery = (path = "", params = { sample: "test" }) => {
  const cleanData = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value != null),
  );
  const query = new URLSearchParams(cleanData).toString();
  return `${path}?${query}`;
};
export const sortItems = (
  items = [],
  sortDescriptor = {},
  getSortValue = (item, column) => item[column],
) => {
  const itemsArray = [...items];
  const { column = "id", direction = "ascending" } = sortDescriptor;

  itemsArray.sort((a, b) => {
    let first = getSortValue(a, column);
    let second = getSortValue(b, column);

    const cmp =
      (first ?? "") < (second ?? "")
        ? -1
        : (first ?? "") > (second ?? "")
          ? 1
          : 0;

    return direction === "descending" ? -cmp : cmp;
  });

  return itemsArray;
};
