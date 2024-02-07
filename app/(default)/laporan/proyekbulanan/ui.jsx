"use client";
import React from "react";
import { BulananProyek } from "@/app/components/laporan";
import { getCurFirstLastDay } from "@/app/utils/date";

const [firstDayOfCurrentMonth, lastDayOfCurrentMonth] = getCurFirstLastDay();

export default function UI() {
  return (
    <>
      <div className="bg-white rounded p-3">
        <div>Laporan Bulanan Proyek</div>
        <BulananProyek
          start={firstDayOfCurrentMonth}
          end={lastDayOfCurrentMonth}
        />
      </div>
    </>
  );
}
