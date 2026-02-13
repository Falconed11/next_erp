import { PEMBAYARAN_PROYEK_ENDPOINT } from "@/services/pembayaran-proyek.service";
import { useDefaultSumFetch } from "./useDefault";

export function useSumPembayaranProyek(periode, aggregate, id_perusahaan) {
  return useDefaultSumFetch({
    endPoint: PEMBAYARAN_PROYEK_ENDPOINT,
    periode,
    aggregate,
    id_perusahaan,
  });
}
