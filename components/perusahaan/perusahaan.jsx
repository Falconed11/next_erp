import { PERUSAHAAN_ENDPOINT } from "../../services/perusahaan.service";
import DefaultSelect from "../default/DefaultSelect";

export const SelectPerusahaan = ({ form, setForm }) => {
  return (
    <DefaultSelect
      label="Perusahaan"
      placeholder="Pilih perusahaan!"
      endPoint={PERUSAHAAN_ENDPOINT}
      fieldName="id_perusahaan"
      form={form}
      setForm={setForm}
    />
  );
};
