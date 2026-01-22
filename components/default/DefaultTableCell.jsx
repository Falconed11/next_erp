import { EditIcon, DeleteIcon } from "@/components/icon";
import { Tooltip } from "@heroui/react";
import { capitalizeEachWord } from "@/app/utils/tools";
import { getDateFId, getTime } from "@/app/utils/date";

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
