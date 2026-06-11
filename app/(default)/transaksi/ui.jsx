"use client";
import { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
  Pagination,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Input,
  Checkbox,
} from "@heroui/react";
import { useClientFetch } from "@/hooks/useClientFetch";
import { getDate, getDateFId } from "@/app/utils/date";
import {
  TRANSAKSI_ENDPOINT,
  saveTransaksi,
  deleteTransaksi,
} from "@/services/transaksi.service";
import {
  highRoleCheck,
  renderQueryStates,
  rolesCheck,
  updateForm,
  useDebounce,
} from "@/app/utils/tools";
import {
  TableHeaderWithAddButton,
  OpenBlueLinkInNewTab,
  MyDateRangePicker,
  MyMinMaxDatePicker,
} from "@/components/mycomponent";
import { renderDefaultTableCell } from "@/components/default/DefaultTable";
import { NumberComp } from "@/components/harga";
import { useTransaksiColumns } from "@/hooks/useTransaksi.hooks";
import { ModalJurnal } from "@/components/transaksi/transaksi";
import { fetchJurnalById } from "@/services/transaksi/jurnal.service";
import { buildTableClassNames } from "@/app/utils/style";
import { SelectPerusahaan } from "@/components/perusahaan/perusahaan";
import { AutocompleteProyek } from "@/components/proyek/proyek";
import { AutocompleteCoa } from "@/components/coa/coa";
import { AutocompleteCustomer } from "@/components/myautocomplete";

export default function TransaksiUI({ user }) {
  const sessionUser = user;
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const offset = (page - 1) * rowsPerPage;
  const [form, setForm] = useState({
    tanggal: "",
    keterangan: "",
    id_perusahaan: "",
    id_proyek: "",
    transaksi: [],
    method: "POST",
  });

  const [filter, setFilter] = useState({});
  const debouncedJurnal = useDebounce(filter.jurnal, 500);
  const [isShowAuditFields, setIsShowAuditFields] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const params = [
    ...(debouncedJurnal
      ? [
          `jurnal=${encodeURIComponent(JSON.stringify({ value: `%${debouncedJurnal}%`, operator: "like" }))}`,
        ]
      : []),
    ...(filter.from ? [`from=${filter.from}`] : []),
    ...(filter.to ? [`to=${filter.to}`] : []),
    ...(filter.id_coa ? [`id_coa=${filter.id_coa}`] : []),
    ...(filter.id_perusahaan ? [`id_perusahaan=${filter.id_perusahaan}`] : []),
    ...(filter.id_proyek ? [`id_proyek=${filter.id_proyek}`] : []),
    ...(filter.id_instansi ? [`id_instansi=${filter.id_instansi}`] : []),
  ].join("&");
  const transaksiData = useClientFetch(
    `${TRANSAKSI_ENDPOINT}?limit=${rowsPerPage}&offset=${offset}&${params}`,
  );

  const handleEditForm = async (data) => {
    onOpen();
    setIsLoading(true);
    const jurnal = await fetchJurnalById(data.id_jurnal);
    const dataJurnal = await jurnal.json();
    setForm({ ...dataJurnal.data, method: "PATCH" });
    setIsLoading(false);
  };

  const isAuthorized =
    highRoleCheck(sessionUser?.role) ||
    rolesCheck(["admin"], sessionUser?.peran);
  const columns = useTransaksiColumns(isAuthorized, isShowAuditFields);

  const loadingState = transaksiData?.isLoading ? "loading" : "idle";
  const queryState = renderQueryStates({});
  if (queryState) return queryState;

  const pages = Math.ceil(transaksiData?.data?.data?.[0]?.total / rowsPerPage);
  const handleOpenForm = () => {
    setForm({
      tanggal: getDate(new Date()),
      keterangan: "",
      id_perusahaan: "",
      id_proyek: "",
      transaksi: [],
      method: "POST",
    });
    onOpen();
  };
  const handleSubmitForm = async (onClose) => {
    if (!form.tanggal || !form.id_perusahaan) {
      return alert("Tanggal dan Perusahaan harus diisi");
    }
    if (!form.transaksi || form.transaksi.length < 2) {
      return alert("Minimal ada 2 transaksi");
    }
    try {
      const res = await saveTransaksi({
        ...form,
        id: form.method === "PATCH" ? form.id : undefined,
        sessIdKaryawan: sessionUser?.id_karyawan,
      });
      transaksiData.mutate();
      onClose();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
    }
  };
  const handleDelete = async (id, { id_jurnal }) => {
    if (!confirm(`Hapus jurnal id: ${id_jurnal}?`)) return;

    try {
      const res = await deleteTransaksi(id_jurnal);
      transaksiData.mutate();
      alert("Jurnal berhasil dihapus");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const addExtraColumnHandlers = (data) => {
    return {
      tanggal: () => getDateFId(data.tanggal),
      debit: () => <NumberComp value={data.tipe == 1 ? data.amount : 0} />,
      kredit: () => <NumberComp value={data.tipe == 0 ? data.amount : 0} />,
      id_proyek: () =>
        data.id_proyek ? (
          <OpenBlueLinkInNewTab link={`/proyek?id_proyek=${data.id_proyek}`}>
            {data.id_proyek}
          </OpenBlueLinkInNewTab>
        ) : (
          "-"
        ),
    };
  };
  // console.log(filter);
  return (
    <div className="">
      <ModalJurnal
        form={form}
        setForm={setForm}
        onSubmit={handleSubmitForm}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isLoading={isLoading}
      />
      {/* Transaksi Table */}
      <Table
        isStriped
        className="w-400 bg-white p-3 rounded-xl"
        classNames={buildTableClassNames({
          sWrapper:
            "h-150 bg-transparent border-none shadow-none p-0 overflow-x-auto",
          base: "",
        })}
        aria-label="Jurnal Transaksi Table"
        topContentPlacement="outside"
        topContent={
          <>
            <TableHeaderWithAddButton
              extraButton={<></>}
              isHighRole={true}
              title="Jurnal Transaksi"
              onPress={handleOpenForm}
            />
            <div className="flex gap-2">
              <Popover shouldCloseOnScroll={false}>
                <PopoverTrigger>
                  <Button color="primary" size="md">
                    Open Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="p-2 flex flex-col gap-3">
                    <Input
                      label="Jurnal"
                      placeholder="Masukkan jurnal!"
                      variant="bordered"
                      value={filter.jurnal}
                      onValueChange={(val) =>
                        updateForm(setFilter, { jurnal: val })
                      }
                    />
                    <MyMinMaxDatePicker form={filter} setForm={setFilter} />
                    {/* <MyDateRangePicker form={filter} setForm={setFilter} /> */}
                    <SelectPerusahaan form={filter} setForm={setFilter} />
                    <AutocompleteProyek form={filter} setForm={setFilter} />
                    <AutocompleteCustomer form={filter} setForm={setFilter} />
                    <AutocompleteCoa form={filter} setForm={setFilter} />
                  </div>
                </PopoverContent>
              </Popover>
              <Checkbox
                isSelected={isShowAuditFields}
                onValueChange={setIsShowAuditFields}
              >
                Show Audit Fields
              </Checkbox>
            </div>
          </>
        }
        bottomContentPlacement="outside"
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                color="primary"
                page={page}
                total={pages}
                onChange={(p) => setPage(p)}
              />
            </div>
          ) : null
        }
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
              // allowsSorting
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={transaksiData?.data?.data ?? []}
          loadingContent={"Loading..."}
          emptyContent={"Tidak ada data jurnal"}
          loadingState={loadingState}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell
                  align={
                    columnKey === "debit" || columnKey === "kredit"
                      ? "right"
                      : "start"
                  }
                  className={"whitespace-nowrap"}
                >
                  {renderDefaultTableCell({
                    data: item,
                    columnKey,
                    onEdit: handleEditForm,
                    onDelete: handleDelete,
                    addExtraColumnHandlers,
                  })}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
