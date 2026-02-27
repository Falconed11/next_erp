import { JENIS_INSTANSI_ENDPOINT } from "../../services/jenis-instansi.service";
import DefaultSelect from "../default/DefaultSelect";

export const SelectJenisInstansi = ({ form, setForm, className }) => {
  return (
    <DefaultSelect
      label="Jenis Instansi"
      placeholder="Pilih jenis instansi!"
      endPoint={JENIS_INSTANSI_ENDPOINT}
      fieldName="id_jenisinstansi"
      form={form}
      setForm={setForm}
      className={className}
    />
  );
};
