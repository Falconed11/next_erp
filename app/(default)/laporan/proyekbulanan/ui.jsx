"use client";
import Harga from "@/components/harga";
import "react-datepicker/dist/react-datepicker.css";
import {
  useCalculatePembayaranProyekByid,
  useCalculatePengeluaranProyekByid,
  useGetMonthlyReportByPeriode,
  useGetProyek,
} from "@/hooks/proyek.hooks";
import { capitalizeEachWord, renderQueryStates } from "@/app/utils/tools";
import {
  MonthlyReport,
  ReportTable,
  ReportTableBody,
} from "@/components/default/DefaultReportTable";
import {
  getCurFirstLastDay,
  getDateFId,
  getFirstDayOfMonth,
  getFirstDayOfNextMonth,
} from "@/app/utils/date";
import { useFindPengeluaranProyek } from "@/hooks/pengeluaran-proyek.hooks";
import { useGetOfferingSummary } from "@/hooks/keranjang-proyek.hooks";
import { LIST_SWASTA_NEGRI } from "@/app/utils/const";
import { useGetPembayaranProyek } from "@/hooks/pembayaran-proyek.hooks";
import { CompanyPeriodeReportPicker } from "@/components/input";
import { useState } from "react";
import { TableProyek } from "@/components/proyek/proyek";

export default function App() {
  const [form, setForm] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const from = getFirstDayOfMonth(form.startDate);
  const to = getFirstDayOfNextMonth(form.endDate);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <CompanyPeriodeReportPicker form={form} setForm={setForm} />
      </div>
      <TableProyek from={from} to={to} />
    </div>
  );
}

const LaporanBiayaProduksi = ({ yearMonth, id_perusahaan }) => {
  const proyekByPeriode = useGetProyek(yearMonth, id_perusahaan);
  const monthlyReports = useGetMonthlyReportByPeriode(yearMonth);

  const QueryState = renderQueryStates({
    proyekByPeriode,
    monthlyReports,
  });
  if (QueryState) return QueryState;
  const { data: dataProyekByperiode } = proyekByPeriode.data;
  const { data: dataMonthlyReports } = monthlyReports.data;

  const sHeader = "font-bold";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <div className="p-2 bg-white text-nowrap rounded-lg font-bold">
          Periode : {yearMonth}
        </div>
      </div>
      {dataProyekByperiode.map((proyek) => (
        <ProjectExpensesTable
          key={proyek.id}
          id_proyek={proyek.id}
          TopContent={({ children }) => (
            <div>
              {!id_perusahaan && <div>{proyek.perusahaan}</div>}
              <div>{proyek.id_second}</div>
              <div>{getDateFId(proyek.tanggal)}</div>
              <div>{capitalizeEachWord(proyek.nama)}</div>
              <div>
                {capitalizeEachWord(LIST_SWASTA_NEGRI[+proyek.swasta].nama)}
              </div>
              <div>{capitalizeEachWord(proyek.instansi)}</div>
              {children}
            </div>
          )}
        />
      ))}
    </div>
  );
};

const ProjectExpensesTable = ({ TopContent, id_proyek }) => {
  const pengeluaranProyek = useFindPengeluaranProyek({ id_proyek });
  const offeringSummary = useGetOfferingSummary(id_proyek);
  const sumPembayaranProyek = useCalculatePembayaranProyekByid({
    id: id_proyek,
    aggregate: "sum",
  });
  const sumPengeluaranProyek = useCalculatePengeluaranProyekByid({
    id: id_proyek,
    aggregate: "sum",
    lunas: null,
  });
  const pembayaranProyek = useGetPembayaranProyek({ proyek: id_proyek });
  const QueryStates = renderQueryStates({
    pengeluaranProyek,
    offeringSummary,
    sumPembayaranProyek,
    sumPengeluaranProyek,
    pembayaranProyek,
  });
  if (QueryStates) return QueryStates;
  const { data } = pengeluaranProyek.data;
  const { nilai_proyek } = offeringSummary.data.data || {};
  const { totalpembayaran } = sumPembayaranProyek.data.data || {};
  const { totalpengeluaran } = sumPengeluaranProyek.data.data || {};
  const { data: dataPembayaran } = pembayaranProyek.data;
  const labaRugi = totalpembayaran - totalpengeluaran;
  const style = "";
  return (
    <ReportTable
      topContent={
        <div className="flex gap-2">
          <TopContent></TopContent>
          <ReportTable
            topContent={<div className="font-bold">Pembayaran Proyek</div>}
          >
            <ReportTableBody
              cells={[
                {
                  style: "text-nowrap",
                  renderCell: (data) => getDateFId(data.tanggal),
                },
                {
                  style: "text-nowrap",
                  renderCell: (data) => data.metodepembayaran,
                },
                {
                  style: "text-nowrap text-right",
                  renderCell: (data) => <Harga harga={data.nominal} />,
                },
              ]}
              rows={dataPembayaran}
            />
          </ReportTable>
          <ReportTable topContent={<div className="font-bold">Ringkasan</div>}>
            <ReportTableBody
              cells={[
                {
                  style: "text-nowrap",
                  renderCell: ({ label }) => label,
                },
                {
                  style: "text-nowrap",
                  renderCell: ({ val }) => <Harga harga={val} />,
                },
              ]}
              rows={[
                { label: "Nilai Proyek", val: nilai_proyek },
                { label: "Total Pembayaran", val: totalpembayaran },
                { label: "Biaya Produksi", val: totalpengeluaran },
                { label: "Laba Rugi", val: labaRugi },
              ]}
            />
          </ReportTable>
        </div>
      }
    >
      <ReportTableBody
        rows={data}
        topRows={[
          [
            { style: "font-bold", cell: "Tanggal" },
            { style: "font-bold", cell: "Karyawan" },
            { style: "font-bold", cell: "Nama" },
            { style: "font-bold", cell: "Tipe" },
            { style: "font-bold", cell: "Merek" },
            { style: "font-bold", cell: "Jumlah" },
            { style: "font-bold", cell: "Satuan" },
            { style: "font-bold", cell: "Harga Satuan" },
            { style: "font-bold", cell: "Total Harga" },
            { style: "font-bold", cell: "Lunas" },
          ],
        ]}
        cells={[
          {
            style: "text-nowrap",
            renderCell: (data) => getDateFId(data.tanggal),
          },
          {
            style: "text-nowrap",
            renderCell: (data) => data.karyawan,
          },
          {
            style: `text-nowrap ${style}`,
            renderCell: (data) => data.produk,
          },
          {
            style: `text-nowrap ${style}`,
            renderCell: (data) => data.tipe,
          },
          {
            style: `text-nowrap ${style}`,
            renderCell: (data) => data.merek,
          },
          {
            style: `text-right ${style}`,
            renderCell: (data) => <Harga harga={data.jumlah} />,
          },
          {
            style: `text-nowrap ${style}`,
            renderCell: (data) => data.satuan,
          },
          {
            style: `text-right ${style}`,
            renderCell: (data) => (
              <Harga harga={data.hargaprodukmasuk || data.harga} />
            ),
          },
          {
            style: `text-right ${style}`,
            renderCell: (data) => (
              <Harga
                harga={data.jumlah * data.hargaprodukmasuk || data.harga}
              />
            ),
          },
          {
            style: `${style}`,
            renderCell: (data) => data.lunas,
          },
        ]}
      />
    </ReportTable>
  );
};
