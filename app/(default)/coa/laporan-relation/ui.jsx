"use client";
import { renderQueryStates } from "@/app/utils/tools";
import { TableWithActiveStatus } from "@/components/default/DefaultTable";
import DefaultSelect from "@/components/default/DefaultSelect";
import {
  AutocompleteCoa,
  AutocompleteCoaSubtype,
  AutocompleteCoaType,
} from "@/components/coa/coa";
import {
  AutocompleteLaporan,
  LaporanRelationForm,
} from "@/components/laporan/laporan";
import {
  deleteLaporanRelation,
  LAPORAN_RELATION_ENDPOINT,
  saveLaporanRelation,
} from "@/services/laporan/laporan-relation.service";

export default function App({ user }) {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  return (
    <div className="flex flex-col gap-2">
      <TableWithActiveStatus
        endPoint={LAPORAN_RELATION_ENDPOINT}
        rowsPerPage={10}
        name={"Laporan Relation"}
        onDelete={deleteLaporanRelation}
        onSave={saveLaporanRelation}
        extraFields={(form, setForm, isFilter) => (
          <LaporanRelationForm
            form={form}
            setForm={setForm}
            isFilter={isFilter}
          />
        )}
        extraColumns={[
          { key: "modifier", label: "Modifier" },
          { key: "id_parent", label: "Parent Laporan" },
          { key: "id_child", label: "Child Laporan" },
          { key: "coa_type", label: "Tipe COA" },
          { key: "coa_subtype", label: "Sub Tipe COA" },
          { key: "coa", label: "COA" },
        ]}
        addExtraColumnHandlers={(data, cellValue) => ({
          id_parent: () => data.parent || data.id_parent,
          id_child: () => data.child || data.id_child,
          modifier: () =>
            cellValue === 1 ? "+1" : cellValue === -1 ? "-1" : cellValue,
          coa_type: () => data.coa_type || cellValue,
          coa_subtype: () => data.coa_subtype || cellValue,
          coa: () => data.coa || cellValue,
        })}
        user={user}
      />
    </div>
  );
}
