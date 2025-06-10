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
} from "@heroui/react";
import { Button } from "@heroui/react";
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

export { Penawaran, OperasionalKantor };
