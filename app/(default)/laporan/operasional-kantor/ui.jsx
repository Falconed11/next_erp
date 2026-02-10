"use client";
import Harga from "@/components/harga";
import "react-datepicker/dist/react-datepicker.css";
import { useSumOperasionalKantor } from "@/hooks/operasional-kantor-hooks";
import { capitalizeEachWord, renderQueryStates } from "@/app/utils/tools";
import {
  MonthlyReport,
  ReportTable,
  ReportTableBody,
} from "@/components/default/DefaultReportTable";

export default function App() {
  return (
    <MonthlyReport
      renderReport={(yearMonth) => (
        <LaporanOperasionalKantor key={yearMonth} yearMonth={yearMonth} />
      )}
    />
  );
}

const LaporanOperasionalKantor = ({ yearMonth }) => {
  const sumOperasionalKantorByKategori = useSumOperasionalKantor(yearMonth);
  const sumOperasionalKantor = useSumOperasionalKantor(yearMonth, "sum");

  const QueryState = renderQueryStates({
    sumOperasionalKantorByKategori,
    sumOperasionalKantor,
  });
  if (QueryState) return QueryState;
  const { data: dataSumByKategori } = sumOperasionalKantorByKategori.data;
  const { data: dataSum } = sumOperasionalKantor.data;

  const totalOperasionalKantor = +dataSum.pengeluaran;
  return (
    <ReportTable yearMonth={yearMonth}>
      <ReportTableBody
        calculationRows={[
          {
            label: "Total",
            value: totalOperasionalKantor,
            valueStyle: "font-bold",
          },
        ]}
        cells={[
          {
            style: "text-nowrap",
            renderCell: (data) => capitalizeEachWord(data.nama),
          },
          {
            style: "text-right",
            renderCell: (data) => <Harga harga={data.pengeluaran} />,
          },
        ]}
        rows={dataSumByKategori}
      />
    </ReportTable>
  );
};
