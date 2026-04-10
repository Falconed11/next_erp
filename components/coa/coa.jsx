import { COA_TYPE_ENDPOINT } from "@/services/coa/coa-type.service";
import DefaultSelect from "../default/DefaultSelect";

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
