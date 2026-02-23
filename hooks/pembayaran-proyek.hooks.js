import { PEMBAYARAN_PROYEK_ENDPOINT } from "@/services/pembayaran-proyek.service";
import { useDefaultSumFetch } from "./useDefault";
import { useClientFetchNoInterval } from "./useClientFetch";
import { urlBuilder } from "@/app/utils/tools";

export function useSumPembayaranProyek(periode, aggregate, id_perusahaan) {
  return useDefaultSumFetch({
    endPoint: PEMBAYARAN_PROYEK_ENDPOINT,
    periode,
    aggregate,
    id_perusahaan,
  });
}

export const useGetPembayaranProyek = ({ proyek }) =>
  useClientFetchNoInterval(
    urlBuilder(PEMBAYARAN_PROYEK_ENDPOINT, [{ key: "proyek", val: proyek }]),
  );
