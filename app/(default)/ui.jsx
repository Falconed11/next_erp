"use client";
import { useState } from "react";
import { getDate } from "@/app/utils/date";
import { useClientFetch } from "@/app/utils/apiconfig";
import { Penawaran, OperasionalKantor } from "@/app/components/laporan";

import DatePicker from "react-datepicker";
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
  return (
    <div className="flex flex-row gap-3">
      <div className="bg-white p-3 rounded-lg">
        <Penawaran start={firstDayOfCurrentMonth} end={lastDayOfCurrentMonth} />
      </div>
      <div className="bg-white p-3 rounded-lg">
        <OperasionalKantor
          start={firstDayOfCurrentMonth}
          end={lastDayOfCurrentMonth}
        />
      </div>
    </div>
  );
}
