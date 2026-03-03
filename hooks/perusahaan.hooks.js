import { PERUSAHAAN_ENDPOINT } from "@/services/perusahaan.service";
import { useDefaultFetch } from "./useDefault";
import { useClientFetchNoInterval } from "./useClientFetch";
import { urlBuilder } from "@/app/utils/tools";

export function useGetPerusahaan() {
  return useDefaultFetch({
    endPoint: PERUSAHAAN_ENDPOINT,
    noInterval: true,
  });
}

export const useGetPerusahaanMonthlyReport = (perusahaan, periode) =>
  useClientFetchNoInterval(
    urlBuilder(`${PERUSAHAAN_ENDPOINT}/${perusahaan}/reports`, [
      { key: "periode", val: periode },
    ]),
  );
