import { PERISTIWA_ENDPOINT } from "@/services/coa/peristiwa.service";
import DefaultSelect from "../default/DefaultSelect";

export const SelectPeristiwa = ({
  form,
  setForm,
  disallowEmptySelection,
  extraLabel = "",
}) => (
  <DefaultSelect
    disallowEmptySelection={disallowEmptySelection}
    endPoint={`${PERISTIWA_ENDPOINT}?aktif=1`}
    fieldName={"id_peristiwa"}
    label={`Peristiwa${extraLabel}`}
    placeholder={"Pilih peristiwa!"}
    form={form}
    setForm={setForm}
  />
);
