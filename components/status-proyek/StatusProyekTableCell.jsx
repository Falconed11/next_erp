// components/statusProyek/StatusProyekTableCell.jsx
import Harga from "@/components/harga";
import { EditIcon, DeleteIcon } from "@/components/icon";
import { Tooltip } from "@heroui/react";
import { capitalizeEachWord } from "@/app/utils/tools";
import { getDateF } from "@/app/utils/date";

const renderStatusProyekCell = ({ data, columnKey, onEdit, onDelete }) => {
  const cellValue = data[columnKey];

  switch (columnKey) {
    case "id":
    case "nproyek":
    case "progress":
      return (
        <div className="text-right">
          <Harga harga={cellValue} />
        </div>
      );

    case "nama":
      return capitalizeEachWord(cellValue);

    case "tanggal":
      return data.tanggal ? getDateF(new Date(data.tanggal)) : "";

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

          {![-1, 1, 2, 3].includes(data.id) && (
            <Tooltip color="danger" content="Delete">
              <span
                onClick={() => onDelete(data)}
                className="cursor-pointer text-danger"
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          )}
        </div>
      );

    default:
      return cellValue;
  }
};
export { renderStatusProyekCell };
