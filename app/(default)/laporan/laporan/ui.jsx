"use client";

import { getDate } from "@/app/utils/date";
import { renderQueryStates } from "@/app/utils/tools";
import { AutocompleteCoa, AutocompleteCoaFilter } from "@/components/coa/coa";
import { AutocompleteLaporan } from "@/components/laporan/laporan";
import { TableWithActiveStatus } from "@/components/default/DefaultTable";
import { EyeIcon } from "@/components/icon";
import { useDefaultFetch } from "@/hooks/useDefault";
import {
  deleteLaporan,
  LAPORAN_ENDPOINT,
  getTreeLaporanEndpoint,
  patchLaporan,
} from "@/services/laporan/laporan.service";
import DefaultSelect from "@/components/default/DefaultSelect";
import { Tooltip } from "@heroui/react";
import { useMemo, useState } from "react";
import ReportTreeSection from "../components/ReportTreeSection";
import {
  addDays,
  buildReportTree,
  normalizeReportResponse,
} from "../utils/reportTree";

export default function App() {
  const [selectedTreeLaporan, setSelectedTreeLaporan] = useState(null);
  const today = useMemo(() => new Date(), []);
  const treePreview = useDefaultFetch({
    endPoint: getTreeLaporanEndpoint({
      id: selectedTreeLaporan?.id,
      from: getDate(today),
      to: getDate(addDays(today, 1)),
      id_perusahaan: 2,
    }),
    noInterval: true,
  });
  const queryStates = renderQueryStates(
    selectedTreeLaporan ? { treePreview } : {},
  );
  const previewTree = useMemo(
    () => buildReportTree(treePreview.data),
    [treePreview.data],
  );
  const previewSummary = useMemo(
    () => normalizeReportResponse(treePreview.data).summary,
    [treePreview.data],
  );

  const handleShowTree = (data) => {
    setSelectedTreeLaporan({
      id: data.id,
      nama: data.nama,
    });
  };

  const handleSaveSuccess = async (json, payload) => {
    if (!selectedTreeLaporan?.id) return;

    const savedId = json?.data?.id ?? payload?.id;
    if (savedId && String(savedId) === String(selectedTreeLaporan.id)) {
      setSelectedTreeLaporan((prev) => ({
        ...prev,
        nama: json?.data?.nama ?? payload?.nama ?? prev.nama,
      }));
    }
    await treePreview.mutate();
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1- min-w-0">
        <TableWithActiveStatus
          endPoint={LAPORAN_ENDPOINT}
          rowsPerPage={10}
          name={"Laporan"}
          onDelete={deleteLaporan}
          onSave={patchLaporan}
          onSaveSuccess={handleSaveSuccess}
          extraFields={(form, setForm) => (
            <>
              <AutocompleteLaporan form={form} setForm={setForm} />
              <AutocompleteCoaFilter form={form} setForm={setForm} />
              <AutocompleteCoa form={form} setForm={setForm} />
              <DefaultSelect
                options={[
                  { id: 1, nama: 1 },
                  { id: -1, nama: -1 },
                ]}
                form={form}
                setForm={setForm}
                label="Modifier"
                placeholder="Pilih modifier!"
                fieldName="modifier"
              />
            </>
          )}
          extraColumns={[
            { key: "parent", label: "Parent" },
            { key: "coa_filter", label: "COA Filter" },
            { key: "coa", label: "COA" },
            { key: "modifier", label: "Modifier" },
          ]}
          renderActionButton={(data) => (
            <Tooltip content="Show Tree">
              <span
                onClick={() => handleShowTree(data)}
                className="cursor-pointer text-default-400"
              >
                <EyeIcon />
              </span>
            </Tooltip>
          )}
        />
      </div>
      <div className="w-full- max-w-3xl rounded-xl border bg-white p-4">
        <div className="mb-4 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-800">Tree Preview</h2>
          <p className="text-sm text-slate-500">
            Menggunakan tanggal hari ini dan perusahaan ID 2.
          </p>
        </div>
        {!selectedTreeLaporan ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
            Tekan Show Tree pada salah satu laporan untuk melihat tree.
          </div>
        ) : queryStates ? (
          queryStates
        ) : previewTree.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
            Tree untuk {selectedTreeLaporan.nama} tidak ditemukan.
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-slate-600">
              Preview laporan:{" "}
              <span className="font-semibold text-slate-800">
                {selectedTreeLaporan.nama}
              </span>
            </div>
            <ReportTreeSection
              reportType="simple"
              reportSummary={previewSummary}
              reportTree={previewTree}
            />
          </>
        )}
      </div>
    </div>
  );
}
