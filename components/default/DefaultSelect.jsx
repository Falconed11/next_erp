import { Select, SelectItem } from "@heroui/react";
import { set2key, key2set, renderQueryStates } from "@/app/utils/tools";
import { useDefaultFetch } from "@/hooks/useDefault";

export default function DefaultSelect({
  label,
  placeholder,
  endPoint,
  filter,
  form,
  setForm,
  fieldName,
  buildTextValue = (data) => data.nama,
  buildText = (data) => data.nama,
  className,
  disallowEmptySelection,
  options,
}) {
  const fetchData =
    options || useDefaultFetch({ endPoint, noInterval: true, filter });
  const QueryState = renderQueryStates({ fetchData });
  if (QueryState) return QueryState;
  const data = options || (fetchData.data.data ?? fetchData.data);
  return (
    <Select
      isRequired={disallowEmptySelection}
      disallowEmptySelection={disallowEmptySelection}
      variant="bordered"
      label={label}
      placeholder={placeholder}
      className={className}
      selectedKeys={key2set(form[fieldName])}
      onSelectionChange={(v) => {
        setForm({
          ...form,
          [fieldName]: set2key(v),
        });
      }}
    >
      {data.map((item) => (
        <SelectItem
          key={item.id}
          value={item.id}
          textValue={buildTextValue(item, form)}
        >
          {buildText(item, form)}
        </SelectItem>
      ))}
    </Select>
  );
}
