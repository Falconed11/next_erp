"use client";
import Harga from "@/components/harga";
import "react-datepicker/dist/react-datepicker.css";
import { useSumOperasionalKantor } from "@/hooks/operasional-kantor-hooks";
import { useSumPembayaranProyek } from "@/hooks/pembayaran-proyek-hooks";
import { useSumPengeluaranProyek } from "@/hooks/pengeluaran-proyek-hooks";
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
        <LaporanLR key={yearMonth} yearMonth={yearMonth} />
      )}
    />
  );
}

const LaporanLR = ({ yearMonth }) => {
  const sumOperasionalKantorByKategori = useSumOperasionalKantor({
    periode: yearMonth,
    groupBy: "kategorioperasionalkantor",
  });
  const sumOperasionalKantor = useSumOperasionalKantor({
    periode: yearMonth,
    aggregate: "sum",
  });
  const sumPembayaranProyek = useSumPembayaranProyek(yearMonth, "sum");
  const sumPengeluaranProyek = useSumPengeluaranProyek(yearMonth, "sum");

  const QueryState = renderQueryStates({
    sumOperasionalKantorByKategori,
    sumOperasionalKantor,
    sumPembayaranProyek,
    sumPengeluaranProyek,
  });
  if (QueryState) return QueryState;
  const { data: dataSumByKategori } = sumOperasionalKantorByKategori.data;
  const { data: dataSum } = sumOperasionalKantor.data;
  const { data: dataSumPembayaranProyek } = sumPembayaranProyek.data;
  const { data: dataSumPengeluaranProyek } = sumPengeluaranProyek.data;

  const totalOperasionalKantor = +dataSum.pengeluaran;
  const totalPembayaran = +dataSumPembayaranProyek.totalValue;
  const totalPengeluaran = +dataSumPengeluaranProyek.totalValue;
  const labaRugi =
    totalPembayaran - (totalPengeluaran + totalOperasionalKantor);
  return (
    <ReportTable yearMonth={yearMonth}>
      <ReportTableBody
        calculationRows={[
          {
            label: "Laba/Rugi sebelum pajak",
            value: labaRugi,
            valueStyle: "font-bold",
          },
          { label: "Pendapatan", value: totalPembayaran },
          { label: "Biaya Produksi", value: totalPengeluaran },
          { label: "Operasional Kantor", value: totalOperasionalKantor },
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
