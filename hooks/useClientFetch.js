"use client";
import { API_PATH } from "@/app/utils/apiconfig";
import useSWR from "swr";

const fetcher = async (...args) => {
  const res = await fetch(...args);
  if (!res.ok) throw new Error("API error");
  return res.json();
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
