import { GOLONGAN_INSTANSI_ENDPOINT } from "@/services/golongan-instansi.service";
import DefaultSelect from "../default/DefaultSelect";

export const SelectGolonganInstansi = ({ form, setForm, className }) => {
  return (
    <DefaultSelect
      label="Golongan Instansi"
      placeholder="Pilih golongan instansi!"
      endPoint={GOLONGAN_INSTANSI_ENDPOINT}
      fieldName="id_golonganinstansi"
      form={form}
      setForm={setForm}
      className={className}
    />
  );
};
