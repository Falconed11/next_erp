"use client";
import { API_PATH } from "@/app/utils/apiconfig";
import { apiFetch } from "@/app/utils/fetchHelper";
import useSWR from "swr";

const fetcher = async (url, options = {}) => {
  return apiFetch(url, options);
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
