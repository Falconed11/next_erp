import { COA_TYPE_ENDPOINT } from "@/services/coa/coa-type.service";
import { COA_SUBTYPE_ENDPOINT } from "@/services/coa/coa-subtype.service";
import { COA_ENDPOINT } from "@/services/coa/coa.service";
import DefaultSelect from "../default/DefaultSelect";
import { useAutocompleteField } from "../myautocomplete";

export const SelectCoaType = ({
  form,
  setForm,
  disallowEmptySelection,
  extraLabel = "",
}) => (
  <DefaultSelect
    disallowEmptySelection={disallowEmptySelection}
    endPoint={`${COA_TYPE_ENDPOINT}?aktif=1`}
    fieldName={"id_coa_type"}
    label={`COA Type${extraLabel}`}
    placeholder={"Pilih tipe coa!"}
    form={form}
    setForm={setForm}
  />
);

export const AutocompleteCoaType = (props) => {
  const { component } = useAutocompleteField({
    endpoint: `${COA_TYPE_ENDPOINT}?aktif=1`,
    title: "Tipe COA",
    field: "coa_type",
    id: "id_coa_type",
    disableCustomValue: true,
    ...props,
  });
  return component;
};

export const AutocompleteCoaSubtype = ({ id_coa_type, ...props }) => {
  const { component } = useAutocompleteField({
    endpoint: `${COA_SUBTYPE_ENDPOINT}?aktif=1${id_coa_type ? `&id_coa_type=${id_coa_type}` : ""}`,
    title: "Sub Tipe COA",
    field: "coa_subtype",
    id: "id_coa_subtype",
    key: id_coa_type,
    disableCustomValue: true,
    disableSelectOnChange: true,
    getCustomLabel: (item) => `${item.nama} | ${item.coa_type}`,
    getCustomValue: (item) => `${item.nama} | ${item.coa_type}`,
    ...props,
  });
  return component;
};

export const AutocompleteCoa = ({ id_coa_type, id_coa_subtype, ...props }) => {
  const { component } = useAutocompleteField({
    endpoint: `${COA_ENDPOINT}?aktif=1${id_coa_type ? `&id_coa_type=${id_coa_type}` : ""}${id_coa_subtype ? `&id_coa_subtype=${id_coa_subtype}` : ""}`,
    title: "COA",
    field: "coa",
    id: "id_coa",
    key: `${id_coa_type}-${id_coa_subtype}`,
    disableCustomValue: true,
    disableSelectOnChange: true,
    getCustomLabel: (item) =>
      `${item.nama} | ${item.coa_subtype} | ${item.coa_type}`,
    getCustomValue: (item) =>
      `${item.nama} | ${item.coa_subtype} | ${item.coa_type}`,
    ...props,
  });
  return component;
};
