"use client";

import { getDate } from "@/app/utils/date";
import { renderQueryStates } from "@/app/utils/tools";
import { AutocompleteLaporan } from "@/components/laporan/laporan";
import { SelectPerusahaan } from "@/components/perusahaan/perusahaan";
import Harga from "@/components/harga";
import { useDefaultFetch } from "@/hooks/useDefault";
import { getTreeLaporanEndpoint } from "@/services/laporan/laporan.service";
import { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function App() {
  const [form, setForm] = useState({
    laporan: "",
    id_laporan: null,
    id_perusahaan: null,
    startDate: null,
    endDate: null,
  });
  const [appliedForm, setAppliedForm] = useState({
    laporan: "",
    id_laporan: null,
    id_perusahaan: null,
    startDate: null,
    endDate: null,
  });

  const laporanTree = useDefaultFetch({
    endPoint: getTreeLaporanEndpoint({
      id: appliedForm.id_laporan,
      from: getDate(appliedForm.startDate),
      to: getDate(appliedForm.endDate),
      id_perusahaan: appliedForm.id_perusahaan,
    }),
    noInterval: true,
  });

  const queryStates = renderQueryStates({
    laporanTree,
  });

  const reportTree = useMemo(() => {
    const rows = laporanTree.data?.data ?? laporanTree.data ?? [];
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
    form.id_laporan == null && appliedForm.id_laporan == null;
  const isSameAsApplied =
    form.laporan === appliedForm.laporan &&
    form.id_laporan === appliedForm.id_laporan &&
    form.id_perusahaan === appliedForm.id_perusahaan &&
    form.startDate?.toDateString?.() ===
      appliedForm.startDate?.toDateString?.() &&
    form.endDate?.toDateString?.() === appliedForm.endDate?.toDateString?.();
  if (queryStates) return queryStates;
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
        <SelectPerusahaan form={form} setForm={setForm} />
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
            onPress={() => setAppliedForm(form)}
            isDisabled={isGenerateDisabled || isSameAsApplied}
          >
            Generate
          </Button>
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
