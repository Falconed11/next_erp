"use client";
import { useState, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  ChipProps,
  getKeyValue,
} from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import * as XLSX from "xlsx";
import {
  useClientFetch,
  useClientFetchNoInterval,
} from "@/app/utils/apiconfig";
import { getDate, getDateF, getMonthYear } from "@/app/utils/date";
import Harga from "@/components/harga";
import { RangeDate } from "@/components/input";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OperasionalKantor = ({ startDate, endDate }) => {
  const kategori = useClientFetchNoInterval("kategorioperasionalkantor");
  const [current, setCurrent] = useState({ startDate, endDate });
  const operasional = useClientFetchNoInterval(
    `totaloperasional?startDate=${getDate(current.startDate)}&endDate=${getDate(
      current.endDate
    )}`
  );
  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  if (operasional.error) return <div>failed to load</div>;
  if (operasional.isLoading) return <div>loading...</div>;
  const totalOperasional = operasional.data.reduce((total, v) => {
    return (total += v.biaya ? parseInt(v.biaya) : 0);
  }, 0);
  return (
    <>
      <div>Operasional Kantor</div>
      <div className="flex">
        <RangeDate current={current} setCurrent={setCurrent} />
      </div>
      <div className="flex flex-row gap-2">
        <div>
          {kategori.data.map((v) => {
            return <div key={v.id}>{v.nama}</div>;
          })}
          <div>Total Operasional</div>
        </div>
        <div className="text-right">
          {operasional.data.map((v) => {
            return (
              <div key={v.id}>
                <Harga harga={parseInt(v.biaya ? v.biaya : 0)} />
              </div>
            );
          })}
          <Harga harga={totalOperasional} />
        </div>
      </div>
    </>
  );
};
const Penawaran = ({ start, end }) => {
  const [current, setCurrent] = useState({
    startDate: start,
    endDate: end,
  });
  const mulai = getDate(current.startDate);
  const selesai = getDate(current.endDate);
  const totalPenawaran = useClientFetch(
    `sumPenawaran?startdate=${mulai}&enddate=${selesai}`
  );
  const totalPenawaranSwasta = useClientFetch(
    `sumPenawaran?startdate=${mulai}&enddate=${selesai}&swasta=1`
  );
  const totalPenawaranReject = useClientFetch(
    `sumPenawaran?startdate=${mulai}&enddate=${selesai}&versi=-1`
  );
  const totalPenawaranWaiting = useClientFetch(
    `sumPenawaran?startdate=${mulai}&enddate=${selesai}&versi=0`
  );

  if (totalPenawaran.error) return <div>failed to load</div>;
  if (totalPenawaran.isLoading) return <div>loading...</div>;
  if (totalPenawaranSwasta.error) return <div>failed to load</div>;
  if (totalPenawaranSwasta.isLoading) return <div>loading...</div>;
  if (totalPenawaranReject.error) return <div>failed to load</div>;
  if (totalPenawaranReject.isLoading) return <div>loading...</div>;
  if (totalPenawaranWaiting.error) return <div>failed to load</div>;
  if (totalPenawaranWaiting.isLoading) return <div>loading...</div>;

  const totalPenawaranNegri =
    totalPenawaran.data[0].total - totalPenawaranSwasta.data[0].total;
  const totalPenawaranDeal =
    totalPenawaran.data[0].total -
    (totalPenawaranReject.data[0].total + totalPenawaranWaiting.data[0].total);
  return (
    <>
      <div>Penawaran</div>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col bg-gray-100 rounded-lg">
          <div className="flex">
            <RangeDate current={current} setCurrent={setCurrent} />
          </div>
        </div>
      </div>
      <div className="flex flex-row">
        <div>
          <div>Total</div>
          <div>Swasta</div>
          <div>Negri</div>
          <div>Deal</div>
          <div>Reject</div>
          <div>Waiting</div>
        </div>
        <div>
          <div> : {totalPenawaran.data[0].total}</div>
          <div> : {totalPenawaranSwasta.data[0].total}</div>
          <div> : {totalPenawaranNegri}</div>
          <div> : {totalPenawaranDeal}</div>
          <div> : {totalPenawaranReject.data[0].total}</div>
          <div> : {totalPenawaranWaiting.data[0].total}</div>
        </div>
      </div>
    </>
  );
};
const BulananProyek = ({ start, end }) => {
  const [form, setForm] = useState({
    startDate: start,
    endDate: end,
  });
  const bulananProyek = useClientFetch(
    `bulananproyek?startDate=${getMonthYear(
      form.startDate
    )}&endDate=${getMonthYear(form.endDate)}`
  );

  const handleButtonExportToExcelPress = () => {
    const rows = bulananProyek.data.map((v) => {
      return {
        instansi: v.instansi,
        nama: v.nama,
        id_proyek: v.id_proyek,
        swasta: v.swasta,
        periode: v.periode,
        byproduksi: v.byproduksi,
        omset: v.omset,
        provit: v.omset - v.byproduksi,
        tt: v.tt,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.writeFile(
      workbook,
      `bulananproyek_${getDateF(form.startDate)}_${getDateF(
        form.endDate
      )}.xlsx`,
      { compression: true }
    );
  };

  const renderCell = useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    const date = new Date(data.tanggal);
    switch (columnKey) {
      case "swasta":
        return data.swasta ? "Swasta" : "Negri";
      case "byproduksi":
        return <Harga harga={+data.byproduksi} />;
      case "omset":
        return <Harga harga={+data.omset} />;
      case "profit":
        return <Harga harga={data.omset - data.byproduksi} />;
      default:
        return cellValue;
    }
  }, []);
  if (bulananProyek.error) return <div>failed to load</div>;
  if (bulananProyek.isLoading) return <div>loading...</div>;

  const col = [
    {
      key: "id_proyek",
      label: "Id Proyek",
    },
    {
      key: "instansi",
      label: "Instansi",
    },
    {
      key: "nama",
      label: "Nama",
    },
    {
      key: "swasta",
      label: "S/N",
    },
    {
      key: "byproduksi",
      label: "Biaya Produksi",
    },
    {
      key: "omset",
      label: "Omset",
    },
    {
      key: "profit",
      label: "Profit",
    },
    {
      key: "tt",
      label: "TT",
    },
    {
      key: "periode",
      label: "Periode",
    },
  ];
  return (
    <>
      <div className="flex flex-row">
        <div className="flex flex-col bg-gray-100 p-3 rounded-lg gap-2">
          <div>Periode</div>
          <DatePicker
            dateFormat="MM/yyyy"
            selected={form.startDate}
            onChange={(date) => setForm({ ...form, startDate: date })}
            selectsStart
            startDate={form.startDate}
            endDate={form.endDate}
            showMonthYearPicker
          />
          <DatePicker
            dateFormat="MM/yyyy"
            selected={form.endDate}
            onChange={(date) => setForm({ ...form, endDate: date })}
            selectsEnd
            startDate={form.startDate}
            endDate={form.endDate}
            minDate={form.startDate}
            showMonthYearPicker
          />
        </div>
      </div>
      <Table
        className="pt-3"
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <Button
                  color="primary"
                  onClick={handleButtonExportToExcelPress}
                >
                  Export to Excel
                </Button>
              </div>
            </div>
          </>
        }
      >
        <TableHeader columns={col}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "actions" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={bulananProyek.data}>
          {(item) => (
            <TableRow key={`${item.id_proyek}-${item.periode}`}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export { Penawaran, OperasionalKantor, BulananProyek };
