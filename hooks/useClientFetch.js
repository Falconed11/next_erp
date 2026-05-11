"use client";
import { API_PATH } from "@/app/utils/apiconfig";
import useSWR from "swr";

// const fetcher = async (...args) => {
//   const res = await fetch(...args);
//   if (!res.ok) {
//     try {
//       const errorData = await res.json();
//       throw new Error(errorData?.message || "API error");
//     } catch (err) {
//       throw new Error(err.message || "API error");
//     }
//   }
//   return res.json();
// };

const fetcher = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let data;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || "API error");
  }

  return data;
};

const getFullPath = (endpoint) => (endpoint ? `${API_PATH}${endpoint}` : null);
export const useClientFetch = (endpoint) => {
  return useSWR(getFullPath(endpoint), fetcher, { refreshInterval: 5000 });
};
export const useClientFetchPagination = (endpoint) => {
  return useSWR(getFullPath(endpoint), fetcher, {
    keepPreviousData: true,
    refreshInterval: 5000,
  });
};
export const useClientFetchInterval = (endpoint, interval) => {
  return useSWR(getFullPath(endpoint), fetcher, { refreshInterval: interval });
};
export const useClientFetchNoInterval = (endpoint) => {
  return useSWR(getFullPath(endpoint), fetcher);
};
