import { COA_TYPE_ENDPOINT } from "@/services/coa/coa-type.service";
import DefaultSelect from "../default/DefaultSelect";
import { renderFilterActive } from "@/app/utils/render";
import { DefaultTable } from "../default/DefaultTable";

export const SelectCoaType = ({ form, setForm, disallowEmptySelection }) => (
  <DefaultSelect
    disallowEmptySelection={disallowEmptySelection}
    endPoint={`${COA_TYPE_ENDPOINT}?aktif=1`}
    fieldName={"id_coa_type"}
    label={"COA Type"}
    placeholder={"Pilih tipe coa!"}
    form={form}
    setForm={setForm}
  />
);

export const CoaTable = ({
  endPoint,
  rowsPerPage,
  name,
  onDelete,
  onSave,
  extraFields,
  extraColumns,
}) => (
  <DefaultTable
    endPoint={endPoint}
    rowsPerPage={rowsPerPage}
    name={name}
    onDelete={onDelete}
    onSave={onSave}
    renderActionButton={renderFilterActive}
    extraFields={extraFields}
    extraColumns={extraColumns}
    enableActiveStatus
  />
);
