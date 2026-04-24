"use client";
import { renderQueryStates } from "@/app/utils/tools";
import { TableWithActiveStatus } from "@/components/default/DefaultTable";
import DefaultSelect from "@/components/default/DefaultSelect";
import {
  deleteCoaType,
  COA_TYPE_ENDPOINT,
  patchCoaType,
} from "@/services/coa/coa-type.service";
import Link from "next/link";
import { Button } from "@heroui/react";
import CoaNavigation from "@/components/coa/CoaNavigation";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  return (
    <div className="flex flex-col gap-2">
      <CoaNavigation />
      <TableWithActiveStatus
        endPoint={COA_TYPE_ENDPOINT}
        rowsPerPage={10}
        name={"Tipe COA"}
        onDelete={deleteCoaType}
        onSave={patchCoaType}
        extraFields={(form, setForm) => (
          <DefaultSelect
            fieldName="normal_balance"
            label="Normal Balance"
            placeholder="Pilih normal balance!"
            options={[
              { id: 1, nama: "Debit" },
              { id: 0, nama: "Kredit" },
            ]}
            disallowEmptySelection
            form={form}
            setForm={setForm}
          />
        )}
        extraColumns={[{ key: "normal_balance", label: "Normal Balance" }]}
        addExtraColumnHandlers={(data, cellValue) => ({
          normal_balance: () =>
            cellValue == null
              ? ""
              : String(cellValue) === "1"
                ? "Debit"
                : "Kredit",
        })}
      />
    </div>
  );
}
