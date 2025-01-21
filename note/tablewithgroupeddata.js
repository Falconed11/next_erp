import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  TableSection,
} from "@heroui/react";

// Assume your data is in this format
const data = [
  { id: 1, name: "Item 1", value: 100, group: "Group A" },
  { id: 2, name: "Item 2", value: 200, group: "Group A" },
  { id: 3, name: "Item 3", value: 300, group: "Group B" },
  // ... more items
];

// Group the data
const groupedData = data.reduce((acc, item) => {
  (acc[item.group] = acc[item.group] || []).push(item);
  return acc;
}, {});

export default function App() {
  return (
    <Table aria-label="Example table with sections">
      <TableHeader>
        <TableColumn>Name</TableColumn>
        <TableColumn>Value</TableColumn>
      </TableHeader>
      <TableBody>
        {Object.entries(groupedData).map(([group, items]) => (
          <TableSection key={group} title={group}>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.value}</TableCell>
              </TableRow>
            ))}
          </TableSection>
        ))}
      </TableBody>
    </Table>
  );
}
