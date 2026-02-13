"use client";
import Harga from "@/components/harga";
import "react-datepicker/dist/react-datepicker.css";
import {
  useOperasionalKantor,
  useSumOperasionalKantor,
} from "@/hooks/operasional-kantor.hooks";
import { useGetProyek } from "@/hooks/proyek.hooks";
import { capitalizeEachWord, renderQueryStates } from "@/app/utils/tools";
import {
  MonthlyReport,
  ReportTable,
  ReportTableBody,
} from "@/components/default/DefaultReportTable";
import { getDateFId } from "@/app/utils/date";
import { useFindPengeluaranProyek } from "@/hooks/pengeluaran-proyek.hooks";

export default function App() {
  return (
    <MonthlyReport
      renderReport={(yearMonth, form) => (
        <LaporanBiayaProduksi
          key={yearMonth}
          yearMonth={yearMonth}
          id_perusahaan={form.id_perusahaan}
        />
      )}
    />
  );
}

const LaporanBiayaProduksi = ({ yearMonth, id_perusahaan }) => {
  const operasionalKantor = useOperasionalKantor(yearMonth, id_perusahaan);
  const sumOperasionalKantor = useSumOperasionalKantor({
    periode: yearMonth,
    aggregate: "sum",
    id_perusahaan,
  });
  const proyekByPeriode = useGetProyek(yearMonth, id_perusahaan);

  const QueryState = renderQueryStates({
    operasionalKantor,
    sumOperasionalKantor,
    proyekByPeriode,
  });
  if (QueryState) return QueryState;
  const { data: dataOperasionalKantor } = operasionalKantor.data;
  const { data: dataSum } = sumOperasionalKantor.data;
  const { data: dataProyekByperiode } = proyekByPeriode.data;

  const totalOperasionalKantor = +dataSum.pengeluaran;
  const sHeader = "font-bold";
  return (
    <div className="flex flex-col gap-2">
      {dataProyekByperiode.map((proyek) => (
        <ProjectExpensesTable
          key={proyek.id}
          id_proyek={proyek.id}
          topContent={
            <div>
              <div>{proyek.id_second}</div>
              <div>{capitalizeEachWord(proyek.nama)}</div>
              <div>{getDateFId(proyek.tanggal)}</div>
            </div>
          }
        />
      ))}
    </div>
  );
};

const ProjectExpensesTable = ({ topContent, id_proyek }) => {
  const pengeluaranProyek = useFindPengeluaranProyek({ id_proyek });
  const QueryStates = renderQueryStates({ pengeluaranProyek });
  if (QueryStates) return QueryStates;
  const { data } = pengeluaranProyek.data;
  return (
    <ReportTable topContent={topContent}>
      <ReportTableBody
        cells={[
          {
            style: "text-nowrap",
            renderCell: (data) => getDateFId(data.tanggal),
          },
          {
            style: "text-nowrap",
            renderCell: (data) => data.produk,
          },
          {
            style: "text-nowrap",
            renderCell: (data) => data.tipe,
          },
          {
            style: "text-nowrap",
            renderCell: (data) => data.merek,
          },
          {
            style: "text-right",
            renderCell: (data) => <Harga harga={data.jumlah} />,
          },
          {
            style: "text-right",
            renderCell: (data) => <Harga harga={data.harga} />,
          },
          {
            style: "text-right",
            renderCell: (data) => <Harga harga={data.jumlah * data.harga} />,
          },
        ]}
        rows={data}
      />
    </ReportTable>
  );
};
