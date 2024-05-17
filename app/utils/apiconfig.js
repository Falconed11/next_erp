import useSWR from "swr";

const getApiPath = () => {
  return process.env.NEXT_PUBLIC_API_PATH;
};
const useClientFetch = (endpoint) => {
  const apiPath = getApiPath();
  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  const fullPath = `${apiPath}${endpoint}`;
  return useSWR(fullPath, fetcher, { refreshInterval: 5000 });
};
const useClientFetchPagination = (endpoint) => {
  const apiPath = getApiPath();
  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  const fullPath = `${apiPath}${endpoint}`;
  return useSWR(fullPath, fetcher, {
    keepPreviousData: true,
    refreshInterval: 5000,
  });
};
const useClientFetchInterval = (endpoint, interval) => {
  const apiPath = getApiPath();
  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  const fullPath = `${apiPath}${endpoint}`;
  return useSWR(fullPath, fetcher, { refreshInterval: interval });
};
const useClientFetchNoInterval = (endpoint) => {
  const apiPath = getApiPath();
  const fetcher = (...args) => fetch(...args).then((res) => res.json());
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
