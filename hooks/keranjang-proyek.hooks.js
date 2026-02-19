import { KERANJANG_PROYEK_ENDPOINT } from "@/services/keranjang-proyek.service";
import { useDefaultSumFetch } from "./useDefault";
import { useClientFetchNoInterval } from "./useClientFetch";
import { urlBuilder } from "@/app/utils/tools";

export const useGetOfferingSummary = (id_proyek) =>
  useClientFetchNoInterval(`${KERANJANG_PROYEK_ENDPOINT}/${id_proyek}/summary`);
// export const useSumPengeluaranProyek = (periode, aggregate, id_perusahaan) => {
//   return useDefaultSumFetch({
//     endPoint: PENGELUARAN_PROYEK_ENDPOINT,
//     periode,
//     aggregate,
//     id_perusahaan,
//   });
// };
// export const useFindPengeluaranProyek = ({ id_proyek }) =>
//   useClientFetchNoInterval(
//     urlBuilder(PENGELUARAN_PROYEK_ENDPOINT, [
//       { key: "idProyek", val: id_proyek },
//     ]),
//   );
