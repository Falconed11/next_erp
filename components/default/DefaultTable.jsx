import { EditIcon, DeleteIcon } from "@/components/icon";
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import {
  capitalizeEachWord,
  highRoleCheck,
  renderQueryStates,
} from "@/app/utils/tools";
import { getDateFId, getTime } from "@/app/utils/date";
import { TableHeaderWithAddButton } from "../mycomponent";
import { useDefaultColumns, useDefaultFetch } from "@/hooks/useDefault";
import { useState } from "react";
import DefaultModal from "./DefaultModal";
import { useSession } from "next-auth/react";

export const renderDefaultTableCell = ({
  data,
  columnKey,
  onEdit,
  onDelete,
}) => {
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
};

export const DefaultTable = ({
  endPoint,
  rowsPerPage,
  onDelete,
  onSave,
  name,
}) => {
  const session = useSession();
  const sessUser = session?.data?.user;

  const [form, setForm] = useState({});
  const [page, setPage] = useState(1);
  const offset = (page - 1) * rowsPerPage;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const data = useDefaultFetch({ endPoint, limit: rowsPerPage, offset });
  const items = data?.data?.data;

  const loadingState = data.isLoading ? "loading" : "idle";
  const tambahButtonPress = () => {
    setForm({
      method: "POST",
      nama: "",
    });
    onOpen();
  };
  const editButtonPress = (data) => {
    setForm({
      ...data,
      method: "PATCH",
      modalmode: "Edit",
    });
    onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus jenis proyek?")) {
      const res = await onDelete(id);
      const json = await res.json();
      if (!res.ok) return alert(json.message);
      data.mutate();
      setPage(1);
    }
  };
  const isHighRole = highRoleCheck(sessUser?.rank);
  const columns = useDefaultColumns(isHighRole);
  const QueryState = renderQueryStates({ data }, session);
  if (QueryState) return QueryState;

  const id_karyawan = sessUser.id_karyawan;

  const pages = Math.ceil(items[0]?.total / rowsPerPage);
  return (
    <>
      <Table
        isStriped
        className="min-h-[40px]"
        aria-label="Example table with custom cells"
        topContent={
          <TableHeaderWithAddButton
            title="Jenis Proyek"
            isHighRole={isHighRole}
            onPress={tambahButtonPress}
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
      <DefaultModal
        data={data}
        form={form}
        id_karyawan={id_karyawan}
        isOpen={isOpen}
        name={name}
        onOpenChange={onOpenChange}
        onSave={onSave}
        setForm={setForm}
      />
    </>
  );
};
