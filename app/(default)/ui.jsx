"use client";
import { getCurFirstLastDay } from "@/app/utils/date";
import { Penawaran, OperasionalKantor } from "@/components/laporan";

import "react-datepicker/dist/react-datepicker.css";

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
  const [startDate, endDate] = getCurFirstLastDay();

  return (
    <div className="flex flex-row gap-3">
      <div className="bg-white p-3 rounded-lg">
        <Penawaran start={firstDayOfCurrentMonth} end={lastDayOfCurrentMonth} />
      </div>
      <div className="bg-white p-3 rounded-lg">
        <OperasionalKantor startDate={startDate} endDate={endDate} />
      </div>
    </div>
  );
}
