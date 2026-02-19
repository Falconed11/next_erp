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
import { useGetOfferingSummary } from "@/hooks/keranjang-proyek.hooks";
import { LIST_SWASTA_NEGRI } from "@/app/utils/const";

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
  const proyekByPeriode = useGetProyek(yearMonth, id_perusahaan);

  const QueryState = renderQueryStates({
    proyekByPeriode,
  });
  if (QueryState) return QueryState;
  const { data: dataProyekByperiode } = proyekByPeriode.data;

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
  const QueryStates = renderQueryStates({ pengeluaranProyek, offeringSummary });
  if (QueryStates) return QueryStates;
  const { data } = pengeluaranProyek.data;
  const { nilai_proyek } = offeringSummary.data;
  const style = "pl-2";
  return (
    <ReportTable
      topContent={
        <TopContent>
          <div className="text-right">
            <Harga harga={nilai_proyek} />
          </div>
        </TopContent>
      }
    >
      <ReportTableBody
        cells={[
          {
            style: "text-nowrap",
            renderCell: (data) => getDateFId(data.tanggal),
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
            renderCell: (data) => <Harga harga={data.harga} />,
          },
          {
            style: `text-right ${style}`,
            renderCell: (data) => <Harga harga={data.jumlah * data.harga} />,
          },
        ]}
        rows={data}
      />
    </ReportTable>
  );
};
