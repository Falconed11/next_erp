"use client";
import { useState } from "react";
import { getDate } from "../utils/date";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useClientFetch } from "../utils/apiconfig";

export default function app() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const nextMonthFirstDay = new Date(
    currentDate.getFullYear(),
    currentMonth + 1,
    1
  );
  const currentMonthFirstDay = new Date(
    currentDate.getFullYear(),
    currentMonth,
    1
  );
  const lastDayOfCurrentMonth = new Date(nextMonthFirstDay - 1);
  const firstDayOfCurrentMonth = new Date(currentMonthFirstDay);

  const [form, setForm] = useState({
    startdate: firstDayOfCurrentMonth,
    enddate: lastDayOfCurrentMonth,
    mulai: getDate(firstDayOfCurrentMonth),
    selesai: getDate(lastDayOfCurrentMonth),
  });
  const totalPenawaran = useClientFetch(
    `sumPenawaran?startdate=${form.mulai}&enddate=${form.selesai}`
  );
  const totalPenawaranSwasta = useClientFetch(
    `sumPenawaran?startdate=${form.mulai}&enddate=${form.selesai}&swasta=1`
  );
  const totalPenawaranReject = useClientFetch(
    `sumPenawaran?startdate=${form.mulai}&enddate=${form.selesai}&versi=-1`
  );
  const totalPenawaranWaiting = useClientFetch(
    `sumPenawaran?startdate=${form.mulai}&enddate=${form.selesai}&versi=0`
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
    <div className="bg-white p-3 rounded-lg">
      <div>Penawaran</div>
      <div className="flex flex-row gap-3">
        <div className="bg-gray-100 p-3 rounded-lg">
          <div>Mulai</div>
          <DatePicker
            placeholderText="Pilih tanggal"
            dateFormat="dd/MM/yyyy"
            selected={form.startdate}
            onChange={(v) =>
              setForm({ ...form, startdate: v, mulai: getDate(v) })
            }
          />
        </div>
        <div className="bg-gray-100 p-3 rounded-lg">
          <div>Selesai</div>
          <DatePicker
            placeholderText="Pilih tanggal"
            dateFormat="dd/MM/yyyy"
            selected={form.enddate}
            onChange={(v) =>
              setForm({ ...form, enddate: v, selesai: getDate(v) })
            }
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
    </div>
  );
}
