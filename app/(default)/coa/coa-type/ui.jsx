"use client";
import { renderQueryStates } from "@/app/utils/tools";
import {
  deleteCoaType,
  COA_TYPE_ENDPOINT,
  patchCoaType,
} from "@/modules/coa/coa-type.service";
import { DefaultTable } from "@/components/default/DefaultTable";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  return (
    <div className="flex flex-col gap-2">
      <DefaultTable
        endPoint={COA_TYPE_ENDPOINT}
        rowsPerPage={10}
        name={"COA Type"}
        onDelete={deleteCoaType}
        onSave={patchCoaType}
      />
    </div>
  );
}
