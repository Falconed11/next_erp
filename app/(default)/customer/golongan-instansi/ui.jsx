"use client";
import { renderQueryStates } from "@/app/utils/tools";
import {
  deleteGolonganInstansi,
  GOLONGAN_INSTANSI_ENDPOINT,
  saveGolonganInstansi,
} from "@/services/golongan-instansi.service";
import { DefaultTable } from "@/components/default/DefaultTable";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  return (
    <div className="flex flex-col gap-2">
      <DefaultTable
        endPoint={GOLONGAN_INSTANSI_ENDPOINT}
        rowsPerPage={10}
        name={"Golongan Instansi"}
        onDelete={deleteGolonganInstansi}
        onSave={saveGolonganInstansi}
      />
    </div>
  );
}
