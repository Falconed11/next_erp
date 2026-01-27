"use client";
import { renderQueryStates } from "@/app/utils/tools";
import {
  deleteJenisProyek,
  JENIS_PROYEK_ENDPOINT,
  saveJenisProyek,
} from "@/services/jenis-proyek.service";
import { DefaultTable } from "@/components/default/DefaultTable";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  return (
    <div className="flex flex-col gap-2">
      <DefaultTable
        endPoint={JENIS_PROYEK_ENDPOINT}
        rowsPerPage={10}
        name={"Jenis Proyek"}
        onDelete={deleteJenisProyek}
        onSave={saveJenisProyek}
      />
    </div>
  );
}
