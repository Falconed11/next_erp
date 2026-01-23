import { EditIcon, DeleteIcon } from "@/components/icon";
import {
  Pagination,
  TableBody,
  TableColumn,
  TableHeader,
  Tooltip,
} from "@heroui/react";
import { capitalizeEachWord } from "@/app/utils/tools";
import { getDateFId, getTime } from "@/app/utils/date";
import { TableHeaderWithAddButton } from "../mycomponent";

export default function renderDefaultTableCell({
  data,
  columnKey,
  onEdit,
  onDelete,
}) {
  const cellValue = data[columnKey];
  switch (columnKey) {
    case "nama":
      return capitalizeEachWord(cellValue);
    case "lastupdate":
      return `${getDateFId(cellValue)} ${getTime(cellValue)}`;
    case "aksi":
      return (
        <div className="flex items-center gap-2 text-lg">
          <Tooltip content="Edit">
            <span
              onClick={() => onEdit(data)}
              className="cursor-pointer text-default-400"
            >
              <EditIcon />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete">
            <span
              onClick={() => onDelete(data.id)}
              className="cursor-pointer text-danger"
            >
              <DeleteIcon />
            </span>
          </Tooltip>
        </div>
      );
    default:
      return cellValue;
  }
}

export const DefaultTable = ({ items, loadingState, isHighRole, onPress }) => {
  return (
    <Table
      isStriped
      className="min-h-[40px]"
      aria-label="Example table with custom cells"
      topContent={
        <TableHeaderWithAddButton
          title="Jenis Proyek"
          isHighRole={isHighRole}
          onPress={onPress}
        />
      }
      bottomContent={
        pages > 0 ? (
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        ) : null
      }
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            align={column.key === "actions" ? "center" : "start"}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={items}
        loadingContent={"Loading..."}
        emptyContent={"Kosong"}
        loadingState={loadingState}
      >
        {(item) => {
          if (!item.id) return;
          return (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderDefaultTableCell({
                    data: item,
                    columnKey,
                    onEdit: editButtonPress,
                    onDelete: deleteButtonPress,
                  })}
                </TableCell>
              )}
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
};
