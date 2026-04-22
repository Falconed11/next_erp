"use client";

import { getDate } from "@/app/utils/date";
import { renderQueryStates } from "@/app/utils/tools";
import { AutocompleteLaporan } from "@/components/laporan/laporan";
import { SelectPerusahaan } from "@/components/perusahaan/perusahaan";
import Harga from "@/components/harga";
import { useDefaultFetch } from "@/hooks/useDefault";
import { getTreeLaporanEndpoint } from "@/services/laporan/laporan.service";
import { useMemo, useState } from "react";
import { Button, Radio, RadioGroup } from "@heroui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const addDays = (date, days) => {
  if (!date) return null;

  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const normalizeReportResponse = (response) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) {
    return {
      tree: payload,
      summary: null,
    };
  }

  if (payload && typeof payload === "object") {
    return {
      tree: Array.isArray(payload.tree) ? payload.tree : [],
      summary: payload,
    };
  }

  return {
    tree: [],
    summary: null,
  };
};

const formatActionTimestamp = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(value);
};

export default function App() {
  const [form, setForm] = useState({
    laporan: "",
    id_laporan: null,
    id_perusahaan: null,
    startDate: null,
    endDate: null,
    reportType: "simple",
  });
  const [appliedForm, setAppliedForm] = useState({
    laporan: "",
    id_laporan: null,
    id_perusahaan: null,
    startDate: null,
    endDate: null,
    reportType: "simple",
  });
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
    const { tree: rows } = normalizeReportResponse(laporanTree.data);
    if (!Array.isArray(rows)) return [];

    const normalizedRows = rows.map((row, index) => ({
      ...row,
      id: row.id,
      id_parent: row.id_parent,
      nama: row.nama,
      level: row.level ?? 0,
      total_balance: Number(row.total_balance ?? 0),
      orderIndex: index,
    }));

    const availableIds = new Set(normalizedRows.map((row) => row.id));

    const childrenByParent = normalizedRows.reduce((acc, row) => {
      const key = row.id_parent ?? "root";
      if (!acc.has(key)) acc.set(key, []);
      acc.get(key).push(row);
      return acc;
    }, new Map());

    const buildTree = (parentId) =>
      (childrenByParent.get(parentId) ?? [])
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((row) => ({
          ...row,
          children: buildTree(row.id),
        }));

    const rootRows = normalizedRows
      .filter(
        (row) => row.id_parent == null || !availableIds.has(row.id_parent),
      )
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((row) => ({
        ...row,
        children: buildTree(row.id),
      }));

    return rootRows;
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
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <header className="mb-8 border-b-2 border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-800">Laporan</h1>
        <p className="text-slate-500 italic">
          Customizable Administrative Report
        </p>
      </header>

      <div className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <AutocompleteLaporan
          title="Laporan"
          field="laporan"
          id="id_laporan"
          form={form}
          setForm={setForm}
        />
        <SelectPerusahaan
          form={form}
          setForm={setForm}
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
          selected={form.startDate}
          onChange={(startDate) => setForm((prev) => ({ ...prev, startDate }))}
        />
        <DatePicker
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
          placeholderText="Sampai tanggal"
          dateFormat="dd/MM/yyyy"
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
            onPress={handleGenerate}
            isDisabled={isGenerateDisabled || isSameAsApplied}
          >
            Generate
          </Button>
          <Button
            variant="bordered"
            onPress={handleRefresh}
            isDisabled={!appliedForm.id_laporan || isRefreshing}
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

      {!appliedForm.id_laporan ? (
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
        <div className="space-y-4">
          {appliedForm.reportType === "full" && reportSummary ? (
            <FullReportSummary summary={reportSummary} />
          ) : null}
          {reportTree.map((rootNode) => (
            <ReportRow key={rootNode.id} node={rootNode} />
          ))}
        </div>
      )}
    </div>
  );
}

const ReportRow = ({ node, depth = 0 }) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`flex flex-col ${depth > 0 ? "mt-2" : "mt-4"}`}>
      {/* Header Row: Displays Name and Total */}
      <div
        className={`flex justify-between items-center p-3 rounded-t-lg border-b
          ${hasChildren ? "bg-slate-100 font-bold" : "bg-white font-medium"}
          ${depth === 0 ? "border-l-4 shadow-sm" : "border-l-2 border-l-slate-300"}
        `}
      >
        <span className="text-slate-700">{node.nama}</span>
        <span className="text-slate-900">
          <Harga harga={node.total_balance} />
        </span>
      </div>

      {/* The Container for Siblings (The "Box") */}
      {hasChildren && (
        <div className="border-l border-r border-b border-slate-200 rounded-b-lg bg-slate-50/30 pl-2 pb-2 shadow-inner">
          {node.children.map((child) => (
            <ReportRow key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FullReportSummary = ({ summary }) => {
  const summaryItems = [
    { label: "Past", value: Number(summary?.past ?? 0) },
    { label: "End", value: Number(summary?.end ?? 0) },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="text-sm font-medium text-slate-500">{item.label}</div>
          <div className="mt-1 text-lg font-bold text-slate-800">
            <Harga harga={item.value} />
          </div>
        </div>
      ))}
    </div>
  );
};
