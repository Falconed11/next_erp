import { VENDOR_JENIS_ENDPOINT } from "../../services/vendor-jenis.service";
import DefaultSelect from "../default/DefaultSelect";

export const SelectVendorJenis = ({
  form,
  setForm,
  className,
  variant,
  disallowEmptySelection,
}) => {
  return (
    <DefaultSelect
      label="Vendor Jenis"
      placeholder="Pilih vendor jenis!"
      endPoint={VENDOR_JENIS_ENDPOINT}
      fieldName="id_vendor_jenis"
      form={form}
      setForm={setForm}
      className={className}
      variant={variant}
      disallowEmptySelection={disallowEmptySelection}
    />
  );
};
