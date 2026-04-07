"use client";
import { renderQueryStates } from "@/app/utils/tools";
import { deleteCoa, COA_ENDPOINT, patchCoa } from "@/services/coa/coa.service";
import { DefaultTable } from "@/components/default/DefaultTable";
import DefaultSelect from "@/components/default/DefaultSelect";
import { COA_SUBTYPE_ENDPOINT } from "@/services/coa/coa-subtype.service";
import { CoaTable, SelectCoaType } from "@/components/coa/coa";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  return (
    <div className="flex flex-col gap-2">
      <CoaTable
        endPoint={COA_ENDPOINT}
        rowsPerPage={10}
        name={"COA"}
        onDelete={deleteCoa}
        onSave={patchCoa}
        extraFields={(form, setForm) => {
          const { id_coa_type } = form;
          return (
            <>
              <SelectCoaType form={form} setForm={setForm} />
              <DefaultSelect
                disallowEmptySelection
                endPoint={`${COA_SUBTYPE_ENDPOINT}?${[...(id_coa_type ? [`id_coa_type=${id_coa_type}`] : []), "aktif=1"].join("&")}`}
                fieldName={"id_coa_subtype"}
                label={"Sub Tipe COA"}
                placeholder={"Pilih sub tipe coa!"}
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
