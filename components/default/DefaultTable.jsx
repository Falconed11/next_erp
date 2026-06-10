import { EditIcon, DeleteIcon } from "@/components/icon";
import {
  Badge,
  Button,
  Input,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
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
  useDebounce,
} from "@/app/utils/tools";
import {
  isDateColumn,
  renderDateTimeComp,
  getDateColumnSortValue,
} from "@/app/utils/dateColumns";
import columnHandlers from "@/app/utils/columnHandlers";
import { TableHeaderWithAddButton, TableTitle } from "../mycomponent";
import { useDefaultColumnsV2, useDefaultFetch } from "@/hooks/useDefault";
import { useMemo, useState } from "react";
import DefaultModal from "./DefaultModal";
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
  const extraHandlers =
    (typeof addExtraColumnHandlers === "function"
      ? addExtraColumnHandlers(data, cellValue)
      : {}) || {};

  // Handler precedence: extraHandlers (from caller) -> default columnHandlers -> fallback
  const handler = extraHandlers[columnKey] ?? columnHandlers[columnKey];

  if (typeof handler === "function") return handler(cellValue, data);
  if (handler && typeof handler.render === "function")
    return handler.render(cellValue, data);

  // fallback: default behavior
  const defaultColumnFallbacks = {
    nama: () => capitalizeEachWord(cellValue),
    lastupdate: () => renderDateTimeComp(cellValue || data.updated_at),
    creationdate: () => renderDateTimeComp(cellValue || data.created_at),
    updated_at: () => renderDateTimeComp(cellValue),
    created_at: () => renderDateTimeComp(cellValue),
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
            onClick={() => onDelete(data.id, data)}
            className="cursor-pointer text-danger"
          >
            <DeleteIcon />
          </span>
        </Tooltip>
      </div>
    ),
  };

  if (defaultColumnFallbacks[columnKey])
    return defaultColumnFallbacks[columnKey]();

  return cellValue;
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
  onSaveSuccess,
  customSort = {
    column: "nama",
    direction: "ascending",
  },
  isRemoveAddButton = false,
  extraDataBeforeAdd = {},
  user,
  autoFilter = true,
  filterDebounceMs,
}) => {
  const sessUser = user;

  const [form, setForm] = useState({});
  const [page, setPage] = useState(1);
  const [isShowInactive, setIsShowInactive] = useState(false);
  const [isShowAuditFields, setIsShowAuditFields] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState(customSort);
  const offset = (page - 1) * rowsPerPage;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [filterForm, setFilterForm] = useState({});
  const debouncedFilters = useDebounce(filterForm, filterDebounceMs);
  const activeFilterCount = Object.values(filterForm).filter(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== "",
  ).length;

  const buildParamsFromFilters = (filtersObj) => {
    const paramsArr = [];
    for (const [k, v] of Object.entries(filtersObj || {})) {
      if (v === undefined || v === null) continue;
      const str = String(v).trim();
      if (!str) continue;
      paramsArr.push(
        `${encodeURIComponent(k)}=${encodeURIComponent(k === "nama" ? JSON.stringify({ value: `%${str}%`, operator: "like" }) : str)}`,
      );
    }
    return paramsArr.join("&");
  };

  const params = buildParamsFromFilters(debouncedFilters);
  const filterString = `${isShowInactive ? "" : "&aktif=1"}${params ? `&${params}` : ""}`;

  const data = useDefaultFetch({
    endPoint: endPoint,
    limit: rowsPerPage,
    offset,
    filter: filterString,
  });
  const items = data?.data?.data;
  const mutate = data?.mutate;

  const sortedItems = useMemo(
    () =>
      sortItems(items || [], sortDescriptor, (item, column) => {
        const extraHandlers =
          typeof addExtraColumnHandlers === "function"
            ? addExtraColumnHandlers(item, item[column])
            : {};

        const extrah = extraHandlers?.[column];
        if (typeof extrah === "function") return extrah();
        if (extrah && typeof extrah.sortValue === "function")
          return extrah.sortValue(item);

        const def = columnHandlers?.[column];
        if (def && typeof def.sortValue === "function")
          return def.sortValue(item);

        if (column === "nama") {
          const value = capitalizeEachWord(item[column]);
          return typeof value === "string" ? value.toLowerCase() : value;
        }

        if (isDateColumn(column)) {
          return getDateColumnSortValue(item, column);
        }

        return item[column];
      }),
    [items, sortDescriptor, addExtraColumnHandlers],
  );

  const loadingState = data.isLoading ? "loading" : "idle";
  const tambahButtonPress = () => {
    setForm({
      method: "POST",
      nama: "",
      ...extraDataBeforeAdd,
    });
    onOpen();
  };
  const editButtonPress = (data) => {
    setForm({
      ...data,
      nama: data?.nama ? data.nama : "",
      method: "PATCH",
      modalmode: "Edit",
    });
    onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm(`Hapus ${name}?`)) {
      const res = await onDelete(id);
      const json = await res.json();
      if (!res.ok) return alert(json.message || "Delete failed");
      mutate();
      setPage(1);
    }
  };
  const isHighRole = highRoleCheck(sessUser?.rank);
  const columns = useDefaultColumnsV2(
    undefined,
    isHighRole,
    extraColumns,
    disableNama,
    isShowAuditFields,
  );
  const QueryState = renderQueryStates({});
  if (QueryState) return QueryState;

  const id_karyawan = sessUser.id_karyawan;
  const pages = Math.ceil((items?.[0]?.total || 0) / rowsPerPage);
  return (
    <>
      <Table
        isStriped
        // selectionBehavior="toggle"
        // selectionMode="single"
        color="primary"
        className="min-h-[40px]"
        aria-label="Example table with custom cells"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        topContent={
          <>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {autoFilter && (
                <Popover shouldCloseOnScroll={false}>
                  <Badge
                    isInvisible={!activeFilterCount}
                    color="danger"
                    className="text-white border-none cursor-pointer hover:bg-red-400"
                    content="X"
                    onClick={() => setFilterForm({})}
                  >
                    <PopoverTrigger>
                      <Button color="primary" size="sm">
                        Filter
                        {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                      </Button>
                    </PopoverTrigger>
                  </Badge>
                  <PopoverContent>
                    <div className="p-3 flex flex-col gap-3 min-w-[300px]">
                      {!disableNama && (
                        <Input
                          label="Nama"
                          placeholder="Cari nama"
                          variant="bordered"
                          value={filterForm.nama || ""}
                          onValueChange={(val) => {
                            setPage(1);
                            setFilterForm((prev) => ({ ...prev, nama: val }));
                          }}
                        />
                      )}
                      <Input
                        label="Keterangan"
                        placeholder="Cari keterangan"
                        variant="bordered"
                        value={filterForm.keterangan || ""}
                        onValueChange={(val) => {
                          setPage(1);
                          setFilterForm((prev) => ({
                            ...prev,
                            keterangan: val,
                          }));
                        }}
                      />
                      {extraFields && (
                        <div className="flex flex-col gap-3">
                          {typeof extraFields === "function"
                            ? extraFields(filterForm, setFilterForm, true)
                            : extraFields}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <Button
                color={isShowAuditFields ? "secondary" : "default"}
                size="sm"
                onPress={() => setIsShowAuditFields((prev) => !prev)}
              >
                {isShowAuditFields ? "Hide Audit" : "Show Audit"}
              </Button>
            </div>
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
          items={sortedItems || []}
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
                            renderFilterActive(data, mutate, onSave, user)}
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
        onSaveSuccess={onSaveSuccess}
        user={user}
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
  filterFields,
  extraColumns,
  disableNama = false,
  addExtraColumnHandlers,
  onSaveSuccess,
  customSort,
  isRemoveAddButton = false,
  extraDataBeforeAdd,
  user,
  autoFilter,
}) => (
  <DefaultTable
    endPoint={endPoint}
    rowsPerPage={rowsPerPage}
    name={name}
    onDelete={onDelete}
    onSave={onSave}
    renderActionButton={renderActionButton}
    extraFields={extraFields}
    filterFields={filterFields}
    extraColumns={extraColumns}
    enableActiveStatus
    disableNama={disableNama}
    addExtraColumnHandlers={addExtraColumnHandlers}
    onSaveSuccess={onSaveSuccess}
    customSort={customSort}
    isRemoveAddButton={isRemoveAddButton}
    extraDataBeforeAdd={extraDataBeforeAdd}
    user={user}
    autoFilter={autoFilter}
  />
);
