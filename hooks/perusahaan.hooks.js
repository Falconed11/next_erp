import { PERUSAHAAN_ENDPOINT } from "@/services/perusahaan.service";
import { useDefaultFetch } from "./useDefault";

export function useGetPerusahaan() {
  return useDefaultFetch({
    endPoint: PERUSAHAAN_ENDPOINT,
    noInterval: true,
  });
}
