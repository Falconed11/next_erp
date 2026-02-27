"use client";
import "react-datepicker/dist/react-datepicker.css";
import {
  getCurFirstLastDay,
  getDateFId,
  getFirstDayOfMonth,
  getFirstDayOfNextMonth,
} from "@/app/utils/date";
import { CompanyPeriodeReportPicker } from "@/components/input";
import { useState } from "react";
import { TableProyek } from "@/components/proyek/proyek";
import { SelectJenisProyek } from "@/components/jenis-proyek/jenisproyek";
import { SelectJenisInstansi } from "@/components/jenis-instansi/jenisinstansi";
import { SelectGolonganInstansi } from "@/components/golongan-instansi/golonganinstansi";

export default function App() {
  const [form, setForm] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const from = getFirstDayOfMonth(form.startDate);
  const to = getFirstDayOfNextMonth(form.endDate);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <CompanyPeriodeReportPicker form={form} setForm={setForm} />
        <div className="bg-white rounded-lg p-2 w-56 flex flex-col gap-2">
          <div className="font-bold">Filter</div>
          <SelectJenisProyek form={form} setForm={setForm} />
          <SelectJenisInstansi form={form} setForm={setForm} />
          <SelectGolonganInstansi form={form} setForm={setForm} />
        </div>
      </div>
      <TableProyek
        from={from}
        to={to}
        jenisproyek={form.id_jenisproyek}
        jenisinstansi={form.id_jenisinstansi}
        golonganinstansi={form.id_golonganinstansi}
        perusahaan={form.id_perusahaan}
      />
    </div>
  );
}
