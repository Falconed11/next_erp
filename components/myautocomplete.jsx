import { API_PATH, useClientFetch } from "@/app/utils/apiconfig";
import { renderQueryStates } from "@/app/utils/tools";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useFilter } from "@react-aria/i18n";
import { useState } from "react";

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
}) => {
  const query = useClientFetch(endpoint);
  const queryStates = renderQueryStates({ queries: { [endpoint]: query } });
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
}) => {
  const [filteredData, setFilteredData] = useState(data);
  const { contains } = useFilter({ sensitivity: "base" });
  const handleSelectionChange = (key) => {
    const item = data.find((i) => i[valueKey] == key);
    setForm((prev) => ({
      ...prev,
      [field]: item?.[labelKey] ?? prev[field] ?? "",
      [id]: key ?? prev[id],
    }));
  };
  const handleInputChange = (value) => {
    const match = data.find(
      (i) => i[labelKey]?.toLowerCase() === value.toLowerCase()
    );
    setFilteredData(data.filter((i) => contains(i[labelKey], value)));
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
      className="max-w-xs"
      inputValue={form[field] ?? ""}
      selectedKey={form[id] ?? null}
      onSelectionChange={handleSelectionChange}
      onInputChange={handleInputChange}
      onOpenChange={(isOpen) => isOpen && setFilteredData(data)}
    >
      {(item) => (
        <AutocompleteItem key={item[valueKey]} textValue={item[labelKey]}>
          {item[labelKey]}
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

export {
  AutocompleteWithCustomValue,
  AutocompleteKategoriProduk,
  AutocompleteMerek,
  AutocompleteVendor,
};
