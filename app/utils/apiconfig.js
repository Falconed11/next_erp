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
const useClientFetch = (endpoint) => {
  const fullPath = `${apiPath}${endpoint}`;
  return useSWR(fullPath, fetcher, { refreshInterval: 5000 });
};
const useClientFetchPagination = (endpoint) => {
  const fullPath = `${apiPath}${endpoint}`;
  return useSWR(fullPath, fetcher, {
    keepPreviousData: true,
    refreshInterval: 5000,
  });
};
const useClientFetchInterval = (endpoint, interval) => {
  const fullPath = `${apiPath}${endpoint}`;
  return useSWR(fullPath, fetcher, { refreshInterval: interval });
};
const useClientFetchNoInterval = (endpoint) => {
  const fullPath = `${apiPath}${endpoint}`;
  return useSWR(fullPath, fetcher);
};

export {
  getApiPath,
  useClientFetch,
  useClientFetchNoInterval,
  useClientFetchInterval,
  useClientFetchPagination,
};
