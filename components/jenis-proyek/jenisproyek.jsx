import { JENIS_PROYEK_ENDPOINT } from "../../services/jenis-proyek.service";
import DefaultSelect from "../default/DefaultSelect";

export const SelectJenisProyek = ({ form, setForm, className }) => {
  return (
    <DefaultSelect
      label="Jenis Proyek"
      placeholder="Pilih jenis proyek!"
      endPoint={JENIS_PROYEK_ENDPOINT}
      fieldName="id_jenisproyek"
      form={form}
      setForm={setForm}
      className={className}
    />
  );
};
