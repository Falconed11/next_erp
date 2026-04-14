import { renderQueryStates } from "@/app/utils/tools";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useFilter } from "@react-aria/i18n";
import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Harga from "./harga";
import { getDateFId } from "@/app/utils/date";
import { JENIS_PROYEK_ENDPOINT } from "@/services/jenis-proyek.service";
import { JENIS_INSTANSI_ENDPOINT } from "@/services/jenis-instansi.service";
import { GOLONGAN_INSTANSI_ENDPOINT } from "@/services/golongan-instansi.service";
import { useClientFetch } from "@/hooks/useClientFetch";

// ✅ Reusable Hook
export const useAutocompleteField = ({
  isDisabled,
  endpoint,
  title,
  form,
  setForm,
  field,
  id,
  labelKey = "nama",
  valueKey = "id",
  className,
  disableCustomValue,
  disableSelectOnChange,
  getCustomLabel,
  getCustomValue,
  getFormUpdateOnSelectionChange,
  disallowEmptySelection,
  key,
}) => {
  const query = useClientFetch(endpoint);
  const data = useMemo(
    () => [...((query?.data?.data ?? query?.data) || [])],
    [query],
  );
  const queryStates = renderQueryStates({ [endpoint]: query });
  if (queryStates) return { component: queryStates };
  const component = (
    <AutocompleteWithCustomValue
      isDisabled={isDisabled}
      title={title}
      data={data}
      form={form}
      setForm={setForm}
      field={field}
      id={id}
      labelKey={labelKey}
      valueKey={valueKey}
      className={className}
      disableCustomValue={disableCustomValue}
      disableSelectOnChange={disableSelectOnChange}
      getCustomLabel={getCustomLabel}
      getCustomValue={getCustomValue}
      getFormUpdateOnSelectionChange={getFormUpdateOnSelectionChange}
      disallowEmptySelection={disallowEmptySelection}
      key={key}
    />
  );
  return { component };
};
// ✅ Core Component
export const AutocompleteWithCustomValue = ({
  isDisabled,
  title,
  data = [],
  form,
  setForm,
  field,
  id,
  valueKey,
  labelKey,
  className = "",
  disableCustomValue,
  disableSelectOnChange,
  getCustomLabel,
  getCustomValue = (i) => i[labelKey],
  getFormUpdateOnSelectionChange = () => {},
  disallowEmptySelection,
}) => {
  const { contains } = useFilter({ sensitivity: "base" });
  const [items, setItems] = useState(data);
  // const filteredData = useMemo(
  //   () => data.filter((i) => contains(getCustomValue(i), form[field] ?? "")),
  //   [data, form[field]] // more specific dependency
  // );
  const handleSelectionChange = (key) => {
    // const item = data.find((i) => i[valueKey] == key);
    let item;
    setItems((prev) => {
      item = prev.find((i) => i[valueKey] == key);
      return data.filter((i) => contains(i[labelKey], item?.[labelKey] || ""));
    });
    setForm((prev) => ({
      ...prev,
      ...(item ? getFormUpdateOnSelectionChange(item) : {}),
      nama: prev.nama,
      [field]: item?.[labelKey] ?? prev[field],
      [id]: key ?? prev[id],
    }));
  };
  const handleInputChange = (value) => {
    let match;
    setItems((prev) => {
      match =
        !disableSelectOnChange &&
        prev.find(
          (i) => getCustomValue(i)?.toLowerCase() === value.toLowerCase(),
        );
      return data.filter((i) => contains(getCustomValue(i), value));
    });
    setForm((prev) => ({
      ...prev,
      [field]: value,
      [id]: match ? match[valueKey] : null,
    }));
  };
  const handleOnBlur = () => {
    // If custom value not allowed, force reset
    setForm((prev) => {
      if (!disableCustomValue) return prev;
      if (prev[id] != null) return prev; // valid selection
      return {
        ...prev,
        [id]: null,
        [field]: "",
      };
    });
  };
  const isInvalid = form[field] && form[id] == null;
  return (
    <Autocomplete
      // isVirtualized={false}
      popoverProps={{ shouldCloseOnScroll: false }}
      className={className}
      classNames={{
        popoverContent: "text-nowrap w-300",
      }}
      isDisabled={isDisabled}
      isRequired={disallowEmptySelection}
      variant="bordered"
      allowsCustomValue={disableCustomValue ? undefined : true}
      label={
        <>
          {title}
          {isInvalid && (
            <span className="text-danger">{" *Data tidak terdaftar"}</span>
          )}
        </>
      }
      items={items || []}
      placeholder={`Cari ${title}`}
      inputValue={form[field] ?? ""}
      selectedKey={form[id] ?? null}
      onInputChange={handleInputChange}
      onSelectionChange={handleSelectionChange}
      onBlur={handleOnBlur}
    >
      {(item) => (
        <AutocompleteItem key={item[valueKey]} textValue={item[labelKey]}>
          {getCustomLabel ? getCustomLabel(item) : item[labelKey]}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};

export const AutocompleteKategoriProduk = (props) => {
  const { component } = useAutocompleteField({
    endpoint: "kategoriproduk",
    title: "Kategori",
    field: "kategoriproduk",
    id: "id_kategori",
    ...props,
  });
  return component;
};
export const AutocompleteCustomer = (props) => {
  const { component } = useAutocompleteField({
    title: "Customer",
    endpoint: "customer",
    field: "instansi",
    id: "id_instansi",
    disableSelectOnChange: true,
    getCustomLabel: (item) => (
      <>
        {item.nama} | {item.swasta ? "Swasta" : "Negri"} | {item.kota} |{" "}
        {item.alamat}
      </>
    ),
    getCustomValue: (item) =>
      [
        item.nama,
        item.swasta ? "Swasta" : "Negri",
        item.kota,
        item.alamat,
      ].join(" "),
    getFormUpdateOnSelectionChange: (item) => ({
      ...item,
      swasta: item?.swasta,
      kota: item?.kota,
      alamat: item?.alamat,
    }),
    ...props,
  });
  return component;
};
export const AutocompleteMerek = (props) => {
  const { component } = useAutocompleteField({
    endpoint: "merek",
    title: "Merek",
    field: "merek",
    id: "id_merek",
    ...props,
  });
  return component;
};
export const AutocompleteJenisProyek = (props) => {
  const { component } = useAutocompleteField({
    endpoint: JENIS_PROYEK_ENDPOINT,
    title: "Jenis Proyek",
    field: "jenisproyek",
    id: "id_jenisproyek",
    ...props,
  });
  return component;
};
export const AutocompleteJenisInstansi = (props) => {
  const { component } = useAutocompleteField({
    endpoint: JENIS_INSTANSI_ENDPOINT,
    title: "Jenis Instansi",
    field: "jenisinstansi",
    id: "id_jenisinstansi",
    ...props,
  });
  return component;
};
export const AutocompleteGolonganInstansi = (props) => {
  const { component } = useAutocompleteField({
    endpoint: GOLONGAN_INSTANSI_ENDPOINT,
    title: "Golongan Instansi",
    field: "golonganinstansi",
    id: "id_golonganinstansi",
    ...props,
  });
  return component;
};
export const AutocompleteVendor = (props) => {
  const { component } = useAutocompleteField({
    endpoint: "vendor?columnName=nama",
    title: "Vendor",
    field: "vendor",
    id: "id_vendor",
    ...props,
  });
  return component;
};
export const AutocompleteProduk = ({
  id_kategori,
  disableCustomValue,
  ...props
}) => {
  const { component } = useAutocompleteField({
    endpoint: `produk?${id_kategori ? `kategori=${id_kategori}` : ""}`,
    title: "Produk",
    field: "produk",
    id: "id_produk",
    disableSelectOnChange: true,
    getCustomLabel: (item) => (
      <>
        {item.nama} | {item.kategoriproduk} | {item.nmerek} | {item.tipe} |{" "}
        <span className="p-1 bg-black text-white">
          {item.stok} {item.satuan}
        </span>{" "}
        | <Harga harga={item.hargamodal} /> | <Harga harga={item.hargajual} /> |{" "}
        {item.keterangan} | {getDateFId(item.tanggal)}
      </>
    ),
    getCustomValue: (item) =>
      [item.nama, item.nmerek, item.tipe, item.keterangan].join(" "),
    getFormUpdateOnSelectionChange: (item) => ({
      ...item,
      oldHargaModal: item?.hargamodal,
      harga: item?.hargajual,
      isSelected: false,
      merek: item?.nmerek,
    }),
    disableCustomValue,
    key: id_kategori,
    ...props,
  });
  return component;
};
