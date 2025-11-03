import { API_PATH, useClientFetch } from "@/app/utils/apiconfig";
import { renderQueryStates } from "@/app/utils/tools";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useFilter } from "@react-aria/i18n";
import { useState } from "react";
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
  const [filteredData, setFilteredData] = useState(data);
  const { contains } = useFilter({ sensitivity: "base" });
  const handleSelectionChange = (key) => {
    // if (form[id] == key) return;
    const item = data.find((i) => i[valueKey] == key);
    // console.log(item);
    setForm((prev) => ({
      ...prev,
      ...getFormUpdateOnSelectionChange(item),
      [field]: item?.[labelKey] ?? prev[field] ?? "",
      [id]: key ?? prev[id],
    }));
  };
  const handleInputChange = (value) => {
    const match =
      !disableSelectOnChange &&
      data.find(
        (i) => getCustomValue(i)?.toLowerCase() === value.toLowerCase()
      );
    setFilteredData(data.filter((i) => contains(getCustomValue(i), value)));
    setForm((prev) => ({
      ...prev,
      [field]: value,
      [id]: match ? match[valueKey] : null,
    }));
  };
  // ✅ Fix: detect null/undefined only, not falsy values like 0
  const isInvalid =
    form[field] && (form[id] === null || form[id] === undefined);
  return (
    <Autocomplete
      popoverProps={{
        shouldCloseOnScroll: false,
      }}
      className={`${className}`}
      // classNames={{ popoverContent: "w-2" }}
      // className="max-w-xs"
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
      allowsCustomValue
      items={filteredData}
      placeholder={`Cari ${title}`}
      inputValue={form[field] ?? ""}
      selectedKey={form[id] ?? null}
      onSelectionChange={handleSelectionChange}
      onInputChange={handleInputChange}
      onOpenChange={(isOpen) => isOpen && setFilteredData(data)}
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
        {item.nama} | {item.nmerek} | {item.tipe} |{" "}
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
  AutocompleteKategoriProduk,
  AutocompleteMerek,
  AutocompleteProduk,
  AutocompleteVendor,
};
