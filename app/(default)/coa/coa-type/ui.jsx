"use client";
import { renderQueryStates } from "@/app/utils/tools";
import { TableWithActiveStatus } from "@/components/default/DefaultTable";
import {
  deleteCoaType,
  COA_TYPE_ENDPOINT,
  patchCoaType,
} from "@/services/coa/coa-type.service";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  return (
    <div className="flex flex-col gap-2">
      <TableWithActiveStatus
        endPoint={COA_TYPE_ENDPOINT}
        rowsPerPage={10}
        name={"Tipe COA"}
        onDelete={deleteCoaType}
        onSave={patchCoaType}
      />
    </div>
  );
}
