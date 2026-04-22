"use client";

import { getDate } from "@/app/utils/date";
import { renderQueryStates } from "@/app/utils/tools";
import { useDefaultFetch } from "@/hooks/useDefault";
import { getTreeLaporanEndpoint } from "@/services/laporan/laporan.service";
import { useMemo, useState } from "react";
import LaporanFilters from "./components/LaporanFilters";
import ReportTreeSection from "./components/ReportTreeSection";
import {
  addDays,
  buildReportTree,
  createInitialReportForm,
  normalizeReportResponse,
} from "./utils/reportTree";

export default function App() {
  const [form, setForm] = useState(createInitialReportForm);
  console.log(form);
  const [appliedForm, setAppliedForm] = useState(createInitialReportForm);
  const [lastAction, setLastAction] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const laporanTree = useDefaultFetch({
    endPoint: getTreeLaporanEndpoint({
      id: appliedForm.id_laporan,
      from: getDate(appliedForm.startDate),
      to: getDate(addDays(appliedForm.endDate, 1)),
      id_perusahaan: appliedForm.id_perusahaan,
      fullReport: appliedForm.reportType === "full",
    }),
    noInterval: true,
  });

  const queryStates = renderQueryStates({
    laporanTree,
  });

  const reportTree = useMemo(() => {
    return buildReportTree(laporanTree.data);
  }, [laporanTree.data]);

  const reportSummary = useMemo(
    () => normalizeReportResponse(laporanTree.data).summary,
    [laporanTree.data],
  );

  const today = useMemo(() => new Date(), []);
  const currentMonthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today],
  );
  const currentMonthEnd = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + 1, 0),
    [today],
  );
  const isDateCleared = form.startDate == null && form.endDate == null;
  const isCurrentMonthSelected =
    form.startDate?.toDateString() === currentMonthStart.toDateString() &&
    form.endDate?.toDateString() === currentMonthEnd.toDateString();
  const isGenerateDisabled =
    form.id_laporan == null ||
    form.id_perusahaan == null ||
    (form.reportType === "full" && form.startDate == null);
  const isSameAsApplied =
    form.laporan === appliedForm.laporan &&
    form.id_laporan === appliedForm.id_laporan &&
    form.id_perusahaan === appliedForm.id_perusahaan &&
    form.reportType === appliedForm.reportType &&
    form.startDate?.toDateString?.() ===
      appliedForm.startDate?.toDateString?.() &&
    form.endDate?.toDateString?.() === appliedForm.endDate?.toDateString?.();
  const hasGeneratedReport = appliedForm.id_laporan != null;

  const handleGenerate = () => {
    setAppliedForm({ ...form });
    setLastAction({
      type: "Generate",
      at: new Date(),
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await laporanTree.mutate();
      setLastAction({
        type: "Refresh",
        at: new Date(),
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="mb-6 gap-3 rounded-xl border bg-white p-4 md:grid-cols-2">
        <LaporanFilters
          form={form}
          setForm={setForm}
          currentMonthStart={currentMonthStart}
          currentMonthEnd={currentMonthEnd}
          isDateCleared={isDateCleared}
          isCurrentMonthSelected={isCurrentMonthSelected}
          isGenerateDisabled={isGenerateDisabled}
          isSameAsApplied={isSameAsApplied}
          hasGeneratedReport={hasGeneratedReport}
          isRefreshing={isRefreshing}
          lastAction={lastAction}
          onGenerate={handleGenerate}
          onRefresh={handleRefresh}
        />
      </div>
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <header className="mb-8 border-b-2 border-slate-800 pb-4">
          <h1 className="text-3xl font-extrabold text-slate-800">Laporan</h1>
          <p className="text-slate-500 italic">
            Customizable Administrative Report
          </p>
        </header>

        {!hasGeneratedReport ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
            Pilih filter lalu tekan Generate untuk menampilkan data tree.
          </div>
        ) : queryStates ? (
          queryStates
        ) : reportTree.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
            Data laporan tidak ditemukan.
          </div>
        ) : (
          <ReportTreeSection
            reportType={appliedForm.reportType}
            reportSummary={reportSummary}
            reportTree={reportTree}
          />
        )}
      </div>
    </div>
  );
}
