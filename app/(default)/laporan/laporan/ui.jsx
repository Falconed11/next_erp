"use client";

import { renderQueryStates } from "@/app/utils/tools";
import { AutocompleteCoa, AutocompleteCoaFilter } from "@/components/coa/coa";
import { AutocompleteLaporan } from "@/components/laporan/laporan";
import { TableWithActiveStatus } from "@/components/default/DefaultTable";
import {
  deleteLaporan,
  LAPORAN_ENDPOINT,
  patchLaporan,
} from "@/services/laporan/laporan.service";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;

  return (
    <div className="flex flex-col gap-2">
      <TableWithActiveStatus
        endPoint={LAPORAN_ENDPOINT}
        rowsPerPage={10}
        name={"Laporan"}
        onDelete={deleteLaporan}
        onSave={patchLaporan}
        extraFields={(form, setForm) => (
          <>
            <AutocompleteLaporan form={form} setForm={setForm} />
            <AutocompleteCoaFilter form={form} setForm={setForm} />
            <AutocompleteCoa form={form} setForm={setForm} />
          </>
        )}
        extraColumns={[
          { key: "parent", label: "Parent" },
          { key: "coa_filter", label: "COA Filter" },
          { key: "coa", label: "COA" },
        ]}
      />
    </div>
  );
}
