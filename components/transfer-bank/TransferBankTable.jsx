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
import { useState } from "react";
import { TransferBankModal } from "@/components/transfer-bank/TransferBankModal";
import { useSession } from "next-auth/react";
import {
  useTransferBankColumns,
  useTransferBankFetch,
} from "@/hooks/transfer-bank.hooks";
import { tableClassNames } from "@/app/utils/style";
import { NumberComp } from "../harga";

export const renderTransferBankTableCell = ({
  data,
  columnKey,
  onEdit,
  onDelete,
}) => {
  const cellValue = data[columnKey];
  switch (columnKey) {
    case "updated_at":
      return `${getDateFId(cellValue)} ${getTime(cellValue)}`;
    case "created_at":
      return `${getDateFId(cellValue)}`;
    case "nominal":
      return <NumberComp value={cellValue} />;
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
export const TransferBankTable = ({ rowsPerPage, onDelete, onSave }) => {
  const name = "Transfer Bank";
  const session = useSession();
  const sessUser = session?.data?.user;

  const [form, setForm] = useState({});
  const [page, setPage] = useState(1);
  const offset = (page - 1) * rowsPerPage;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const data = useTransferBankFetch({ limit: rowsPerPage, offset });
  const items = data?.data?.data;

  const loadingState = data.isLoading ? "loading" : "idle";
  const tambahButtonPress = () => {
    setForm({
      method: "POST",
      nama: "",
      tanggal: new Date(),
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
    if (confirm("Hapus transfer bank?")) {
      const res = await onDelete(id);
      const json = await res.json();
      if (!res.ok) return alert(json.message);
      data.mutate();
      setPage(1);
    }
  };
  const isHighRole = highRoleCheck(sessUser?.rank);
  const columns = useTransferBankColumns(isHighRole);
  const QueryState = renderQueryStates({ data }, session);
  if (QueryState) return QueryState;

  const pages = Math.ceil(items[0]?.total / rowsPerPage);
  console.log("tes");
  return (
    <>
      <Table
        classNames={tableClassNames}
        isStriped
        className="min-h-[40px]"
        aria-label="Example table with custom cells"
        topContent={
          <TableHeaderWithAddButton
            title={name}
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
                    {renderTransferBankTableCell({
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
      <TransferBankModal
        mutate={data.mutate}
        form={form}
        setForm={setForm}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSave={onSave}
      />
    </>
  );
};
