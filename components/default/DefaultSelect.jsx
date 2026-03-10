import { Select, SelectItem } from "@heroui/react";
import { set2key, key2set, renderQueryStates } from "@/app/utils/tools";
import { useDefaultFetch } from "@/hooks/useDefault";

export default function DefaultSelect({
  label,
  placeholder,
  endPoint,
  form,
  setForm,
  fieldName,
  buildTextValue = (data) => data.nama,
  buildText = (data) => data.nama,
  className,
  disallowEmptySelection,
}) {
  const fetchData = useDefaultFetch({ endPoint, noInterval: true });
  const QueryState = renderQueryStates({ fetchData });
  if (QueryState) return QueryState;
  const data = fetchData.data.data ?? fetchData.data;
  return (
    <Select
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
          textValue={buildTextValue(item)}
        >
          {buildText(item)}
        </SelectItem>
      ))}
    </Select>
  );
}
