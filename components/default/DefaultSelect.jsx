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
}) {
  const fetchData = useDefaultFetch({ endPoint });
  const QueryState = renderQueryStates({ fetchData });
  if (QueryState) return QueryState;
  const data = fetchData.data;
  return (
    <Select
      label={label}
      placeholder={placeholder}
      className=""
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
