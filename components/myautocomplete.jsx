import { API_PATH, useClientFetch } from "@/app/utils/apiconfig";
import { renderQueryStates } from "@/app/utils/tools";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useFilter } from "@react-aria/i18n";
import { useCallback, useMemo, useState } from "react";
import Harga from "./harga";
import { getDateFId } from "@/app/utils/date";

// ✅ Reusable Hook
const useAutocompleteField = ({
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
}) => {
  const query = useClientFetch(endpoint);
  const queryStates = renderQueryStates({ [endpoint]: query });
  if (queryStates) return { component: queryStates };
  const data = query.data;
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
    />
  );
  return { component };
};
// ✅ Core Component
const AutocompleteWithCustomValue = ({
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
}) => {
  const { contains } = useFilter({ sensitivity: "base" });
  const filteredData = useMemo(
    () => data.filter((i) => contains(getCustomValue(i), form[field] ?? "")),
    [data, form[field]] // more specific dependency
  );
  const handleSelectionChange = (key) => {
    const item = data.find((i) => i[valueKey] == key);
    setForm((prev) => ({
      ...prev,
      ...getFormUpdateOnSelectionChange(item),
      nama: prev.nama,
      [field]: item?.[labelKey] ?? prev[field],
      [id]: key ?? prev[id],
    }));
  };
  const handleInputChange = (value) => {
    const match =
      !disableSelectOnChange &&
      filteredData.find(
        (i) => getCustomValue(i)?.toLowerCase() === value.toLowerCase()
      );
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
  console.log({ filteredData });
  return (
    <Autocomplete
      popoverProps={{ shouldCloseOnScroll: false }}
      className={className}
      isDisabled={isDisabled}
      variant="bordered"
      label={
        <>
          {title}
          {isInvalid && (
            <span className="text-danger">{" *Data tidak terdaftar"}</span>
          )}
        </>
      }
      items={filteredData}
      placeholder={`Cari ${title}`}
      inputValue={form[field] ?? ""}
      selectedKey={form[id] ?? null}
      onSelectionChange={handleSelectionChange}
      onInputChange={handleInputChange}
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

const AutocompleteKategoriProduk = (props) => {
  const { component } = useAutocompleteField({
    endpoint: "kategoriproduk",
    title: "Kategori",
    field: "kategoriproduk",
    id: "id_kategori",
    ...props,
  });
  return component;
};
const AutocompleteCustomer = (props) => {
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
const AutocompleteMerek = (props) => {
  const { component } = useAutocompleteField({
    endpoint: "merek",
    title: "Merek",
    field: "merek",
    id: "id_merek",
    ...props,
  });
  return component;
};
const AutocompleteVendor = (props) => {
  const { component } = useAutocompleteField({
    endpoint: "vendor",
    title: "Vendor",
    field: "vendor",
    id: "id_vendor",
    ...props,
  });
  return component;
};
const AutocompleteProduk = ({ id_kategori, disableCustomValue, ...props }) => {
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
    ...props,
  });
  return component;
};

export {
  AutocompleteWithCustomValue,
  AutocompleteCustomer,
  AutocompleteKategoriProduk,
  AutocompleteMerek,
  AutocompleteProduk,
  AutocompleteVendor,
};
