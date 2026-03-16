"use client";
import Harga from "@/components/harga";
import "react-datepicker/dist/react-datepicker.css";
import {
  useOperasionalKantor,
  useSumOperasionalKantor,
} from "@/hooks/operasional-kantor.hooks";
import { capitalizeEachWord, renderQueryStates } from "@/app/utils/tools";
import {
  MonthlyReport,
  ReportTable,
  ReportTableBody,
} from "@/components/default/DefaultReportTable";
import { getDateFId } from "@/app/utils/date";

export default function App() {
  return (
    <MonthlyReport
      renderReport={(yearMonth, form) => (
        <LaporanOperasionalKantor
          key={yearMonth}
          yearMonth={yearMonth}
          id_perusahaan={form.id_perusahaan}
        />
      )}
    />
  );
}

const LaporanOperasionalKantor = ({ yearMonth, id_perusahaan }) => {
  const operasionalKantor = useOperasionalKantor(yearMonth, id_perusahaan);
  const sumOperasionalKantor = useSumOperasionalKantor({
    periode: yearMonth,
    aggregate: "sum",
    id_perusahaan,
  });

  const QueryState = renderQueryStates({
    operasionalKantor,
    sumOperasionalKantor,
  });
  if (QueryState) return QueryState;
  const { data: dataOperasionalKantor } = operasionalKantor.data;
  const { data: dataSum } = sumOperasionalKantor.data;

  const totalOperasionalKantor = +dataSum.pengeluaran;
  const sHeader = "font-bold";
  return (
    <ReportTable yearMonth={yearMonth}>
      <ReportTableBody
        cells={[
          {
            style: "text-nowrap",
            renderCell: (data) => getDateFId(data.tanggal),
          },
          {
            style: "text-nowrap",
            renderCell: (data) => data.perusahaan,
          },
          {
            style: "text-nowrap px-2",
            renderCell: (data) =>
              capitalizeEachWord(data.kategorioperasionalkantor),
          },
          {
            style: "text-nowrap px-2",
            renderCell: (data) => data.keterangan,
          },
          {
            style: "text-right",
            renderCell: (data) => <Harga harga={data.biaya} />,
          },
        ]}
        topRows={[
          [
            { style: "font-bold", cell: "Total" },
            {},
            {},
            {},
            {
              style: "text-right font-bold text-blue-600",
              cell: <Harga harga={totalOperasionalKantor} />,
            },
          ],
          [
            {
              style: sHeader,
              cell: "Tanggal",
            },
            {
              style: sHeader,
              cell: "Perusahaan",
            },
            {
              style: sHeader,
              cell: "Kategori",
            },
            {
              style: sHeader,
              cell: "Keterangan",
            },
            {
              style: sHeader,
              cell: "Biaya",
            },
          ],
        ]}
        rows={dataOperasionalKantor}
      />
    </ReportTable>
  );
};
