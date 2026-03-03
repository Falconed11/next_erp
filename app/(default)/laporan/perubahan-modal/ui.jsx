"use client";
import Harga from "@/components/harga";
import "react-datepicker/dist/react-datepicker.css";
import { renderQueryStates } from "@/app/utils/tools";
import { MonthlyReport } from "@/components/default/DefaultReportTable";
import { useGetPerusahaanMonthlyReport } from "@/hooks/perusahaan.hooks";

export default function App() {
  return (
    <MonthlyReport
      id_perusahaan={1}
      renderReport={(yearMonth, form) => (
        <LaporanPerubahanModal
          key={yearMonth}
          yearMonth={yearMonth}
          id_perusahaan={form.id_perusahaan}
        />
      )}
    />
  );
}

const LaporanPerubahanModal = ({ yearMonth, id_perusahaan }) => {
  const monthlyReport = useGetPerusahaanMonthlyReport(id_perusahaan, yearMonth);
  const QueryState = renderQueryStates({ monthlyReport });
  if (QueryState) return QueryState;
  const { data: dataMontlyReport } = monthlyReport.data;
  console.log(monthlyReport.data.data);
  const sHeader = "font-bold";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <div className="p-2 bg-white text-nowrap rounded-lg font-bold">
          Periode : {yearMonth}
        </div>
      </div>
      <div className="bg-white p-2 rounded-lg flex flex-col gap-2">
        <div>Awal</div>
        <div>Penambahan</div>
        <div>
          Laba/Rugi: <Harga harga={dataMontlyReport.labarugi} />
        </div>
        <div>Total</div>
        <div>Pengurangan</div>
        <div>Total</div>
        <div>Akhir</div>
      </div>
    </div>
  );
};
