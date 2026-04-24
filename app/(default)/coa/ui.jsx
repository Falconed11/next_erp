"use client";
import { buildURLPathQuery, renderQueryStates } from "@/app/utils/tools";
import { deleteCoa, COA_ENDPOINT, patchCoa } from "@/services/coa/coa.service";
import DefaultSelect from "@/components/default/DefaultSelect";
import { COA_SUBTYPE_ENDPOINT } from "@/services/coa/coa-subtype.service";
import {
  AutocompleteCoaType,
  AutocompleteCoaSubtype,
} from "@/components/coa/coa";
import { TableWithActiveStatus } from "@/components/default/DefaultTable";
import Link from "next/link";
import { Button } from "@heroui/react";
import CoaNavigation from "@/components/coa/CoaNavigation";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  const generateCustomSelectCoaSubtypeText = (data, form) =>
    `${data.nama}${form.id_coa_type ? `` : ` | ${data.coa_type}`}`;
  return (
    <div className="flex flex-col gap-2">
      <CoaNavigation />
      <TableWithActiveStatus
        endPoint={COA_ENDPOINT}
        rowsPerPage={10}
        name={"COA"}
        onDelete={deleteCoa}
        onSave={patchCoa}
        extraFields={(form, setForm) => {
          const { id_coa_type } = form;
          return (
            <>
              <AutocompleteCoaType
                extraLabel={" (Filter)"}
                form={form}
                setForm={setForm}
              />
              <AutocompleteCoaSubtype
                disallowEmptySelection
                id_coa_type={id_coa_type}
                form={form}
                setForm={setForm}
              />
            </>
          );
        }}
        extraColumns={[
          { key: "coa_type", label: "Tipe COA" },
          { key: "coa_subtype", label: "Sub Tipe COA" },
        ]}
      />
    </div>
  );
}
