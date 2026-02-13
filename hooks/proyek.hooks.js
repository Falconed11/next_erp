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
