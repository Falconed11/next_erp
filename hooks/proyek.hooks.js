import { urlBuilder } from "@/app/utils/tools";
import { useClientFetchNoInterval } from "./useClientFetch";
import { PROYEK_ENDPOINT } from "@/services/proyek.service";
import { useMemo } from "react";

export const useProyekReportsColumns = (isHighRole) =>
  useMemo(() => {
    return [
      { key: "perusahaan", label: "Perusahaan" },
      { key: "tanggal", label: "Tanggal" },
      { key: "id_second", label: "Id" },
      { key: "nama", label: "Proyek" },
      { key: "instansi", label: "Instansi" },
      { key: "jenisproyek", label: "Jenis Proyek" },
      { key: "jenisinstansi", label: "Jenis Instansi" },
      { key: "golonganinstansi", label: "Golongan Instansi" },
      { key: "swasta", label: "S/N" },
      { key: "totalpengeluaran", label: "Biaya Produksi" },
      { key: "totalpembayaran", label: "Omset" },
      { key: "profit", label: "Profit" },
      { key: "karyawan", label: "Sales" },
      // { key: "bank", label: "Bank" },
      { key: "riwayatpembayaran", label: "Riwayat Pembayaran" },
    ];
  }, [isHighRole]);

export const useGetProyek = (periode, id_perusahaan) =>
  useClientFetchNoInterval(
    urlBuilder(PROYEK_ENDPOINT, [
      { key: "periode", val: periode },
      { key: "idPerusahaan", val: id_perusahaan },
    ]),
  );
export const useGetMonthlyReportByPeriode = ({
  from,
  to,
  jenisproyek,
  jenisinstansi,
  golonganinstansi,
  perusahaan,
}) =>
  useClientFetchNoInterval(
    urlBuilder(`${PROYEK_ENDPOINT}/reports/monthly`, [
      { key: "from", val: from },
      { key: "to", val: to },
      { key: "jenisproyek", val: jenisproyek },
      { key: "jenisinstansi", val: jenisinstansi },
      { key: "golonganinstansi", val: golonganinstansi },
      { key: "perusahaan", val: perusahaan },
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
