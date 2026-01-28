"use client";
import { renderQueryStates } from "@/app/utils/tools";
import {
  deleteJenisInstansi,
  JENIS_INSTANSI_ENDPOINT,
  saveJenisInstansi,
} from "@/services/jenis-instansi.service";
import { DefaultTable } from "@/components/default/DefaultTable";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  return (
    <div className="flex flex-col gap-2">
      <DefaultTable
        endPoint={JENIS_INSTANSI_ENDPOINT}
        rowsPerPage={10}
        name={"Jenis Instansi"}
        onDelete={deleteJenisInstansi}
        onSave={saveJenisInstansi}
      />
    </div>
  );
}
