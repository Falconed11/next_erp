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
  sortItems,
} from "@/app/utils/tools";
import { getDateFId, getTime } from "@/app/utils/date";
import { TableHeaderWithAddButton, TableTitle } from "../mycomponent";
import { useDefaultColumns, useDefaultFetch } from "@/hooks/useDefault";
import { useMemo, useState } from "react";
import DefaultModal from "./DefaultModal";
import { useSession } from "next-auth/react";
import { renderFilterActive } from "@/app/utils/render";
import { FilterActive } from "../filter";

export const renderDefaultTableCell = ({
  data,
  columnKey,
  onEdit,
  onDelete,
  renderActionButton = () => <></>,
  addExtraColumnHandlers = () => ({}),
}) => {
  const cellValue = data?.[columnKey];
  const renderDateTimeComp = (date) => `${getDateFId(date)} ${getTime(date)}`;
  const columnHandlers = {
    nama: () => capitalizeEachWord(cellValue),
    lastupdate: () => renderDateTimeComp(cellValue || data.updated_at),
    creationdate: () => renderDateTimeComp(cellValue || data.created_at),
    aksi: () => (
      <div className="flex items-center gap-2 text-lg">
        <Tooltip content="Edit">
          <span
            onClick={() => onEdit(data)}
            className="cursor-pointer text-default-400"
          >
            <EditIcon />
          </span>
        </Tooltip>
        {renderActionButton(data)}
        <Tooltip color="danger" content="Delete">
          <span
            onClick={() => onDelete(data.id)}
            className="cursor-pointer text-danger"
          >
            <DeleteIcon />
          </span>
        </Tooltip>
      </div>
    ),
    ...addExtraColumnHandlers(data, cellValue),
  };
  const renderFn = columnHandlers[columnKey];
  return typeof renderFn === "function" ? renderFn() : cellValue;
};

export const DefaultTable = ({
  endPoint,
  rowsPerPage,
  onDelete,
  onSave,
  name,
  extraFields,
  extraColumns,
  enableActiveStatus,
  renderActionButton,
  generateTableCellClassName = () => "",
  disableNama = false,
  addExtraColumnHandlers,
  customSort = {
    column: "nama",
    direction: "ascending",
  },
  isRemoveAddButton = false,
}) => {
  const session = useSession();
  const sessUser = session?.data?.user;

  const [form, setForm] = useState({});
  const [page, setPage] = useState(1);
  const [isShowInactive, setIsShowInactive] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState(customSort);
  const offset = (page - 1) * rowsPerPage;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const data = useDefaultFetch({
    endPoint: endPoint,
    limit: rowsPerPage,
    offset,
    filter: `${isShowInactive ? "" : "&aktif=1"}`,
  });
  const items = data?.data?.data;
  const mutate = data?.mutate;

  const sortedItems = useMemo(
    () => sortItems(items || [], sortDescriptor),
    [items, sortDescriptor],
  );

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
    if (confirm(`Hapus ${name}?`)) {
      const res = await onDelete(id);
      const json = await res.json();
      if (!res.ok) return alert(json.message);
      mutate();
      setPage(1);
    }
  };
  const isHighRole = highRoleCheck(sessUser?.rank);
  const columns = useDefaultColumns(isHighRole, extraColumns, disableNama);
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
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        topContent={
          <>
            {isRemoveAddButton ? (
              <TableTitle>{name}</TableTitle>
            ) : (
              <TableHeaderWithAddButton
                title={name}
                isHighRole={isHighRole}
                onPress={tambahButtonPress}
              />
            )}
            {enableActiveStatus && (
              <FilterActive
                isShowInactive={isShowInactive}
                setIsShowInactive={setIsShowInactive}
              />
            )}
          </>
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
              allowsSorting
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={sortedItems}
          loadingContent={"Loading..."}
          emptyContent={"Kosong"}
          loadingState={loadingState}
        >
          {(item) => {
            if (!item.id) return;
            return (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell
                    className={`${enableActiveStatus && !item.aktif ? "bg-red-200" : ""} ${generateTableCellClassName(item)}`}
                  >
                    {renderDefaultTableCell({
                      data: item,
                      columnKey,
                      onEdit: editButtonPress,
                      onDelete: deleteButtonPress,
                      renderActionButton: (data) => (
                        <>
                          {enableActiveStatus &&
                            renderFilterActive(data, mutate, onSave)}
                          {renderActionButton &&
                            renderActionButton(data, mutate, onSave)}
                        </>
                      ),
                      addExtraColumnHandlers: addExtraColumnHandlers,
                    })}
                  </TableCell>
                )}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
      <DefaultModal
        data={{ mutate: data.mutate }}
        form={form}
        id_karyawan={id_karyawan}
        isOpen={isOpen}
        name={name}
        onOpenChange={onOpenChange}
        onSave={onSave}
        setForm={setForm}
        extraFields={extraFields}
        disableNama={disableNama}
      />
    </>
  );
};

export const TableWithActiveStatus = ({
  endPoint,
  rowsPerPage,
  name,
  onDelete,
  onSave,
  renderActionButton,
  extraFields,
  extraColumns,
  disableNama = false,
  addExtraColumnHandlers,
  customSort,
  isRemoveAddButton = false,
}) => (
  <DefaultTable
    endPoint={endPoint}
    rowsPerPage={rowsPerPage}
    name={name}
    onDelete={onDelete}
    onSave={onSave}
    renderActionButton={renderActionButton}
    extraFields={extraFields}
    extraColumns={extraColumns}
    enableActiveStatus
    disableNama={disableNama}
    addExtraColumnHandlers={addExtraColumnHandlers}
    customSort={customSort}
    isRemoveAddButton={isRemoveAddButton}
  />
);
