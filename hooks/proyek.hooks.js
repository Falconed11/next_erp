import { urlBuilder } from "@/app/utils/tools";
import { useClientFetchNoInterval } from "./useClientFetch";
import { PROYEK_ENDPOINT } from "@/services/proyek.service";

export const useGetProyek = (periode, id_perusahaan) =>
  useClientFetchNoInterval(
    urlBuilder(PROYEK_ENDPOINT, [
      { key: "periode", val: periode },
      { key: "idPerusahaan", val: id_perusahaan },
    ]),
  );
export const useCalculatePengeluaranProyekByid = ({ id, aggregate, lunas }) =>
  useClientFetchNoInterval(
    urlBuilder(`${PROYEK_ENDPOINT}/${id}/pengeluaran`, [
      { key: "aggregate", val: aggregate },
      { key: "lunas", val: lunas },
    ]),
  );
export const useCalculatePembayaranProyekByid = ({ id, aggregate }) =>
  useClientFetchNoInterval(
    urlBuilder(`${PROYEK_ENDPOINT}/${id}/pembayaran`, [
      { key: "aggregate", val: aggregate },
    ]),
  );
