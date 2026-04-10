"use client";
import { buildURLPathQuery, renderQueryStates } from "@/app/utils/tools";
import { deleteCoa, COA_ENDPOINT, patchCoa } from "@/services/coa/coa.service";
import DefaultSelect from "@/components/default/DefaultSelect";
import { COA_SUBTYPE_ENDPOINT } from "@/services/coa/coa-subtype.service";
import { SelectCoaType } from "@/components/coa/coa";
import { TableWithActiveStatus } from "@/components/default/DefaultTable";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  const generateCustomSelectCoaSubtypeText = (data, form) =>
    `${data.nama}${form.id_coa_type ? `` : ` | ${data.coa_type}`}`;
  return (
    <div className="flex flex-col gap-2">
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
              <SelectCoaType
                extraLabel={" (Filter)"}
                form={form}
                setForm={setForm}
              />
              <DefaultSelect
                disallowEmptySelection
                endPoint={buildURLPathQuery(COA_SUBTYPE_ENDPOINT, {
                  id_coa_type,
                  aktif: 1,
                })}
                fieldName={"id_coa_subtype"}
                label={"Sub Tipe COA"}
                placeholder={"Pilih sub tipe coa!"}
                form={form}
                setForm={setForm}
                buildText={generateCustomSelectCoaSubtypeText}
                buildTextValue={generateCustomSelectCoaSubtypeText}
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
