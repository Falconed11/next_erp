import { useClientFetch } from "@/app/utils/apiconfig";
import { Select, SelectItem } from "@heroui/react";
export default function SelectStatusProyek({ select, setSelect }) {
  const statusproyek = useClientFetch("statusproyek");
  const queries = {
    statusproyek,
  };
  for (const [name, data] of Object.entries(queries)) {
    if (data.error) return <div>Failed to load {name}</div>;
    if (data.isLoading) return <div>Loading {name}...</div>;
  }
  return (
    <Select
      label="Status Proyek"
      placeholder="Pilih status proyek!"
      className=""
      selectedKeys={new Set(select ? [String(select)] : [])}
      variant="bordered"
      onSelectionChange={(v) => setSelect(v.values().next().value)}
    >
      {statusproyek.data.map((item) => (
        <SelectItem key={item.id} value={item.id}>
          {item.nama} {item.progress}%
        </SelectItem>
      ))}
    </Select>
  );
}
