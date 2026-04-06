export const SelectCoaType = ({ form, setForm }) => (
  <DefaultSelect
    disallowEmptySelection
    endPoint={COA_TYPE_ENDPOINT}
    fieldName={"id_coa_type"}
    label={"COA Type"}
    placeholder={"Pilih tipe coa!"}
    form={form}
    setForm={setForm}
  />
);
