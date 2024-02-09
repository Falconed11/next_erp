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
import {
  useClientFetch,
  useClientFetchNoInterval,
} from "@/app/utils/apiconfig";
import { getDate, getMonthYear } from "@/app/utils/date";
import Harga from "@/components/harga";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OperasionalKantor = ({ start, end }) => {
  const kategori = useClientFetchNoInterval("kategorioperasionalkantor");
  const [startDate, setStartDate] = useState(new Date(start));
  const [endDate, setEndDate] = useState(new Date(end));
  const operasional = useClientFetchNoInterval(
    `totaloperasional?startDate=${getDate(startDate)}&endDate=${getDate(
      endDate
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
      <div className="flex flex-col bg-gray-100 p-3 rounded-lg">
        <div>Periode</div>
        <DatePicker
          dateFormat="dd/MM/yyyy"
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
        />
        <DatePicker
          dateFormat="dd/MM/yyyy"
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
        />
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
  const [form, setForm] = useState({
    startDate: start,
    endDate: end,
  });
  const mulai = getDate(form.startDate);
  const selesai = getDate(form.endDate);
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
        <div className="flex flex-col bg-gray-100 p-3 rounded-lg">
          <div>Periode</div>
          <DatePicker
            dateFormat="dd/MM/yyyy"
            selected={form.startDate}
            onChange={(date) => setForm({ ...form, startDate: date })}
            selectsStart
            startDate={form.startDate}
            endDate={form.endDate}
          />
          <DatePicker
            dateFormat="dd/MM/yyyy"
            selected={form.endDate}
            onChange={(date) => setForm({ ...form, endDate: date })}
            selectsEnd
            startDate={form.startDate}
            endDate={form.endDate}
            minDate={form.startDate}
          />
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
  const mulai = getDate(form.startDate);
  const selesai = getDate(form.endDate);
  return (
    <>
      <div className="flex flex-col bg-gray-100 p-3 rounded-lg">
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
      <Table className="pt-3" aria-label="Example table with custom cells">
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
            <TableRow key={`${item.id}-${item.periode}`}>
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
