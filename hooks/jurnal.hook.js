import { TRANSAKSI_ENDPOINT } from "@/services/transaksi.service";
import { useClientFetch } from "./useClientFetch";

export const useFindJurnalById = (id) =>
  useClientFetch(id ? `${TRANSAKSI_ENDPOINT}/${id}` : null);
