"use client";
import { API_PATH } from "@/app/utils/apiconfig";
import { apiFetch } from "@/app/utils/fetchHelper";
import useSWR from "swr";

const getFullPath = (endpoint) => (endpoint ? `${API_PATH}${endpoint}` : null);

const fetcher = async (url, options = {}) => {
  // 1. Let apiFetch do its job (Do NOT disable error handling)
  const res = await apiFetch(url, options, false);

  // 2. Check if the response actually has content before parsing JSON
  const contentType = res.headers.get("content-type");
  if (
    res.status === 204 ||
    !contentType ||
    !contentType.includes("application/json")
  ) {
    return null;
  }

  return res.json();
};

export const useClientFetch = (endpoint) => {
  const url = getFullPath(endpoint);

  // 3. Conditional Fetching: If the endpoint contains "undefined", don't fetch yet!
  const shouldFetch = endpoint && !endpoint.includes("undefined") ? url : null;

  return useSWR(shouldFetch, fetcher, {
    refreshInterval: 5000,
    shouldRetryOnError: false, // Prevents violent loop flooding if an API breaks
  });
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
