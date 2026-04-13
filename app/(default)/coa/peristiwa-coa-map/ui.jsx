"use client";
import { renderQueryStates, updateForm } from "@/app/utils/tools";
import {
  deletePeristiwaCoaMap,
  PERISTIWA_COA_MAP_ENDPOINT,
  patchPeristiwaCoaMap,
} from "@/services/coa/peristiwa_coa_map.service";
import { SelectPeristiwa } from "@/components/coa/peristiwa";
import DefaultSelect from "@/components/default/DefaultSelect";
import { TableWithActiveStatus } from "@/components/default/DefaultTable";
import { Input } from "@heroui/react";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  return (
    <div className="flex flex-col gap-2">
      <TableWithActiveStatus
        endPoint={PERISTIWA_COA_MAP_ENDPOINT}
        rowsPerPage={10}
        name={"Peristiwa COA Map"}
        onDelete={deletePeristiwaCoaMap}
        onSave={patchPeristiwaCoaMap}
        disableNama
        extraFields={(form, setForm) => (
          <>
            <SelectPeristiwa
              disallowEmptySelection
              form={form}
              setForm={setForm}
            />
            <DefaultSelect
              disallowEmptySelection
              options={[
                { nama: "Debit", id: 1 },
                { nama: "Kredit", id: 0 },
              ]}
              fieldName={"entry_tipe"}
              label={"Entry Type"}
              placeholder={"Pilih entry type!"}
              form={form}
              setForm={setForm}
            />
            <Input
              label="Amount Source"
              placeholder="Masukkan amount source"
              value={form.amount_source}
              onValueChange={(val) =>
                updateForm(setForm, { amount_source: val })
              }
              fieldName="amount_source"
            />
          </>
        )}
        extraColumns={[
          { key: "peristiwa", label: "Peristiwa" },
          { key: "entry_tipe", label: "Entry Type" },
          { key: "amount_source", label: "Amount Source" },
        ]}
        addExtraColumnHandlers={(data, cellValue) => ({
          entry_tipe: () => (cellValue ? "Debit" : "Kredit"),
        })}
        customSort={{
          column: "peristiwa",
          direction: "ascending",
        }}
      />
    </div>
  );
}
