"use client";

import { AutocompleteLaporan } from "@/components/laporan/laporan";
import { SelectPerusahaan } from "@/components/perusahaan/perusahaan";
import { Button, Radio, RadioGroup } from "@heroui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatActionTimestamp } from "../utils/reportTree";

export default function LaporanFilters({
  form,
  setForm,
  currentMonthStart,
  currentMonthEnd,
  isDateCleared,
  isCurrentMonthSelected,
  isGenerateDisabled,
  isSameAsApplied,
  hasGeneratedReport,
  isRefreshing,
  lastAction,
  onGenerate,
  onRefresh,
}) {
  return (
    <div className="flex flex-col gap-2">
      <AutocompleteLaporan
        title="Laporan"
        field="laporan"
        id="id_laporan"
        variant="bordered"
        form={form}
        setForm={setForm}
      />
      <SelectPerusahaan
        form={form}
        setForm={setForm}
        variant="bordered"
        disallowEmptySelection
      />
      <div className="rounded-xl border border-slate-300 bg-white px-4 py-3 md:col-span-2">
        <RadioGroup
          label="Tipe Report"
          orientation="horizontal"
          value={form.reportType}
          onValueChange={(reportType) =>
            setForm((prev) => ({
              ...prev,
              reportType,
              startDate:
                reportType === "full" && prev.startDate == null
                  ? new Date(currentMonthStart)
                  : prev.startDate,
            }))
          }
        >
          <Radio value="simple">Simple Report</Radio>
          <Radio value="full">Full Report</Radio>
        </RadioGroup>
        {form.reportType === "full" && form.startDate == null ? (
          <div className="mt-2 text-sm text-danger">
            From date wajib diisi untuk full report.
          </div>
        ) : null}
      </div>
      <DatePicker
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
        placeholderText="Dari tanggal"
        dateFormat="dd/MM/yyyy"
        isClearable
        selected={form.startDate}
        onChange={(startDate) => setForm((prev) => ({ ...prev, startDate }))}
      />
      <DatePicker
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
        placeholderText="Sampai tanggal"
        dateFormat="dd/MM/yyyy"
        isClearable
        selected={form.endDate}
        minDate={form.startDate}
        onChange={(endDate) => setForm((prev) => ({ ...prev, endDate }))}
      />
      <div className="flex gap-2 md:col-span-2">
        <Button
          color="danger"
          onPress={() =>
            setForm((prev) => ({
              ...prev,
              startDate: null,
              endDate: null,
            }))
          }
          isDisabled={isDateCleared}
        >
          Clear Date
        </Button>
        <Button
          color="primary"
          onPress={() =>
            setForm((prev) => ({
              ...prev,
              startDate: new Date(currentMonthStart),
              endDate: new Date(currentMonthEnd),
            }))
          }
          isDisabled={isCurrentMonthSelected}
        >
          Current Month
        </Button>
        <Button
          color="primary"
          onPress={onGenerate}
          isDisabled={isGenerateDisabled || isSameAsApplied}
        >
          Generate
        </Button>
        <Button
          variant="bordered"
          onPress={onRefresh}
          isDisabled={!hasGeneratedReport || isRefreshing}
          isLoading={isRefreshing}
        >
          Refresh
        </Button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 md:col-span-2">
        Last action:{" "}
        <span className="font-semibold text-slate-800">
          {lastAction?.type ?? "-"}
        </span>{" "}
        at{" "}
        <span className="font-semibold text-slate-800">
          {formatActionTimestamp(lastAction?.at)}
        </span>
      </div>
    </div>
  );
}
