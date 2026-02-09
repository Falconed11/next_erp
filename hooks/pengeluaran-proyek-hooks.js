import { PENGELUARAN_PROYEK_ENDPOINT } from "@/services/pengeluaran-proyek.service";
import { useDefaultSumFetch } from "./useDefault";

export function useSumPengeluaranProyek(periode, aggregate) {
  return useDefaultSumFetch(PENGELUARAN_PROYEK_ENDPOINT, periode, aggregate);
}
