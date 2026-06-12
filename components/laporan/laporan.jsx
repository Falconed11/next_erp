import { LAPORAN_ENDPOINT } from "@/services/laporan/laporan.service";
import { useAutocompleteField } from "../my/myautocomplete";
import DefaultSelect from "../default/DefaultSelect";
import {
  AutocompleteCoa,
  AutocompleteCoaSubtype,
  AutocompleteCoaType,
} from "../coa/coa";
import { Divider } from "@heroui/react";

export const AutocompleteLaporan = ({ isLaporanOnly = false, ...props }) => {
  const { component } = useAutocompleteField({
    endpoint:
      props.endpoint ??
      `${LAPORAN_ENDPOINT}?aktif=1${isLaporanOnly ? "&isReport=1" : ""}`,
    title: props.title ?? "Laporan",
    field: props.field ?? "laporan",
    id: props.id ?? "id_laporan",
    disableCustomValue: props.disableCustomValue ?? true,
    variant: props.variant,
    ...props,
  });
  return component;
};

export const LaporanRelationForm = ({
  form,
  setForm,
  isFilter,
  isDisabledLaporan = false,
}) => {
  const isLaporanSelected = form.id_child;
  const isCoasSelected = form.coa || form.coa_subtype || form.coa_type;
  const CustomDivider = () => (
    <Divider orientation="horizontal" className="bg-primary" />
  );
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
        isDisabled={isDisabledLaporan}
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
