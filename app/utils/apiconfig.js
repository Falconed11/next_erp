import useSWR from "swr";

const getApiPath = () => {
  return process.env.NEXT_PUBLIC_API_PATH;
};
const apiPath = getApiPath();
const fetcher = async (...args) => {
  const res = await fetch(...args);
  if (!res.ok) throw new Error("API error");
  return res.json();
};
const getFullPath = (endpoint) => (endpoint ? `${apiPath}${endpoint}` : null);
const useClientFetch = (endpoint) => {
  return useSWR(getFullPath(endpoint), fetcher, { refreshInterval: 5000 });
};
const useClientFetchPagination = (endpoint) => {
  return useSWR(getFullPath(endpoint), fetcher, {
    keepPreviousData: true,
    refreshInterval: 5000,
  });
};
const useClientFetchInterval = (endpoint, interval) => {
  return useSWR(getFullPath(endpoint), fetcher, { refreshInterval: interval });
};
const useClientFetchNoInterval = (endpoint) => {
  return useSWR(getFullPath(endpoint), fetcher);
};

export {
  getApiPath,
  useClientFetch,
  useClientFetchNoInterval,
  useClientFetchInterval,
  useClientFetchPagination,
};
