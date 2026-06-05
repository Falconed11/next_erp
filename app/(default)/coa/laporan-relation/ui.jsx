"use client";
import { renderQueryStates } from "@/app/utils/tools";
import { TableWithActiveStatus } from "@/components/default/DefaultTable";
import DefaultSelect from "@/components/default/DefaultSelect";
import {
  AutocompleteCoa,
  AutocompleteCoaSubtype,
  AutocompleteCoaType,
} from "@/components/coa/coa";
import { AutocompleteLaporan } from "@/components/laporan/laporan";
import {
  deleteLaporanRelation,
  LAPORAN_RELATION_ENDPOINT,
  saveLaporanRelation,
} from "@/services/laporan/laporan-relation.service";
import { Divider } from "@heroui/react";

export default function App({ user }) {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  const CustomDivider = () => (
    <Divider orientation="horizontal" className="bg-primary" />
  );
  const LaporanRelationForm = ({ form, setForm, isFilter }) => {
    const isLaporanSelected = form.id_child;
    const isCoasSelected = form.coa || form.coa_subtype || form.coa_type;
    return (
      <>
        <DefaultSelect
          options={[
            { id: 1, nama: "+1" },
            { id: -1, nama: "-1" },
          ]}
          fieldName="modifier"
          label="Modifier"
          placeholder="Pilih modifier"
          form={form}
          setForm={setForm}
          disallowEmptySelection={!isFilter}
        />
        <AutocompleteLaporan
          form={form}
          setForm={setForm}
          title="Parent"
          field="parent"
          id="id_parent"
          disallowEmptySelection={!isFilter}
        />
        <CustomDivider />
        <AutocompleteLaporan
          form={form}
          setForm={setForm}
          title="Child"
          field="child"
          id="id_child"
          isDisabled={isCoasSelected}
        />
        <CustomDivider />
        <AutocompleteCoaType
          form={form}
          setForm={setForm}
          isDisabled={isLaporanSelected}
        />
        <AutocompleteCoaSubtype
          form={form}
          setForm={setForm}
          isDisabled={isLaporanSelected}
        />
        <AutocompleteCoa
          form={form}
          setForm={setForm}
          isDisabled={isLaporanSelected}
        />
      </>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <TableWithActiveStatus
        endPoint={LAPORAN_RELATION_ENDPOINT}
        rowsPerPage={10}
        name={"Laporan Relation"}
        onDelete={deleteLaporanRelation}
        onSave={saveLaporanRelation}
        // disableNama
        extraFields={(form, setForm) => (
          <LaporanRelationForm form={form} setForm={setForm} isFilter={false} />
        )}
        filterFields={(form, setForm) => (
          <LaporanRelationForm form={form} setForm={setForm} isFilter={true} />
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
