"use client";
import Harga from "@/components/harga";
import "react-datepicker/dist/react-datepicker.css";
import { renderQueryStates } from "@/app/utils/tools";
import { MonthlyReport } from "@/components/default/DefaultReportTable";
import { useGetPerusahaanMonthlyReport } from "@/hooks/perusahaan.hooks";

export default function App() {
  return (
    <MonthlyReport
      disallowEmptySelection
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
  const sHeader = "font-bold";
  const {
    saldoAwal,
    modalAwal,
    labaRugi,
    penambahanModal,
    totalPenambahan,
    prive,
    totalPengurangan,
    totalPerubahan,
    saldoAkhir,
  } = dataMontlyReport;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <div className="p-2 bg-white text-nowrap rounded-lg font-bold">
          Periode : {yearMonth}
        </div>
      </div>
      <div className="bg-white p-2 rounded-lg flex flex-col gap-2">
        <div>
          Saldo Awal <Harga harga={saldoAwal} />
        </div>
        {/* <div>
          Modal Awal <Harga harga={modalAwal} />
        </div> */}
        <div className="font-bold">
          Penambahan: <Harga harga={totalPenambahan} />
        </div>
        <div>
          Modal: <Harga harga={penambahanModal} />
        </div>
        <div>
          Laba/Rugi: <Harga harga={labaRugi} />
        </div>
        <div className="font-bold">
          Pengurangan: <Harga harga={totalPengurangan} />
        </div>
        <div>
          Prive <Harga harga={prive} />
        </div>
        <div className="font-bold">
          Total: <Harga harga={totalPerubahan} />
        </div>
        <div>
          Saldo Akhir <Harga harga={saldoAkhir} />{" "}
        </div>
      </div>
    </div>
  );
};
