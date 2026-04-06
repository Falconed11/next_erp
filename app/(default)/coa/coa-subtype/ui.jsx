"use client";
import { renderQueryStates } from "@/app/utils/tools";
import {
  deleteCoaSubType,
  COA_SUBTYPE_ENDPOINT,
  patchCoaSubType,
} from "@/services/coa/coa-subtype.service";
import { DefaultTable } from "@/components/default/DefaultTable";
import { SelectCoaType } from "@/components/coa/coa";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  return (
    <div className="flex flex-col gap-2">
      <DefaultTable
        endPoint={COA_SUBTYPE_ENDPOINT}
        rowsPerPage={10}
        name={"Sub Tipe COA"}
        onDelete={deleteCoaSubType}
        onSave={patchCoaSubType}
        extraFields={(form, setForm) => (
          <SelectCoaType form={form} setForm={setForm} />
        )}
        extraColumns={[{ key: "coa_type", label: "Tipe COA" }]}
      />
    </div>
  );
}
