import { PEMBAYARAN_PROYEK_ENDPOINT } from "@/services/pembayaran-proyek.service";
import { useDefaultSumFetch } from "./useDefault";

export function useSumPembayaranProyek(periode, aggregate) {
  return useDefaultSumFetch(PEMBAYARAN_PROYEK_ENDPOINT, periode, aggregate);
}
