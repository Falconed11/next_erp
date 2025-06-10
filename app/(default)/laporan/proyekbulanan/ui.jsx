"use client";
import React from "react";
import { getCurFirstLastDay } from "@/app/utils/date";

const [firstDayOfCurrentMonth, lastDayOfCurrentMonth] = getCurFirstLastDay();

export default function UI() {
  return (
    <>
      <div className="bg-white rounded-sm p-3">
        <div>Laporan Bulanan Proyek</div>
      </div>
    </>
  );
}
