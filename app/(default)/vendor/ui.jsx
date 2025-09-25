"use client";
import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  useClientFetch,
  getApiPath,
  useClientFetchPagination,
} from "@/app/utils/apiconfig";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  Pagination,
  ChipProps,
  getKeyValue,
} from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { Input } from "@heroui/react";
import { Textarea } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import Link from "next/link";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
  NoteIcon,
  ReportMoneyIcon,
  TransferIcon,
} from "../../../components/icon";
import {
  getCurFirstLastDay,
  excelToJSDate,
  getDate,
  getDateF,
} from "@/app/utils/date";
import Harga from "@/components/harga";
import { LinkOpenNewTab } from "@/components/mycomponent";
import { FileUploader } from "@/components/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const apiPath = getApiPath();

export default function App() {
  const vendor = useClientFetch("hutangvendor");
  const [value, setValue] = React.useState("");
  const [form, setForm] = useState({});
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 25;

  const saveButtonPress = async (onClose) => {
    // if (form.isSwasta.size == 0) return alert("Swasta/Negri belum diisi");
    const res = await fetch(`${apiPath}vendor`, {
      method: form.method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    vendor.mutate();
    onClose();
    //return alert(json.message);
  };
  const saveTransferButtonPress = async (onClose) => {
    // if (form.isSwasta.size == 0) return alert("Swasta/Negri belum diisi");
    const res = await fetch(`${apiPath}transfervendor`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        currentId: form.currentId,
        targetId: form.vendor,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    vendor.mutate();
    onClose();
    //return alert(json.message);
  };
  const tambahButtonPress = () => {
    setForm({
      id: "",
      nama: "",
      alamat: "",
      method: "POST",
      title: "Tambah",
    });
    onOpen();
  };
  const editButtonPress = (data) => {
    setForm({
      ...data,
      method: "PUT",
      title: "Edit",
    });
    onOpen();
  };
  const transferButtonPress = (data) => {
    setForm({
      currentId: data.id,
      nama: data.nama,
    });
    transfer.onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus vendor?")) {
      const res = await fetch(`${apiPath}vendor`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (res.status == 400) return alert(json.message);
      vendor.mutate();
    }
  };

  const handleFileUpload = (jsonData) => {
    // console.log(jsonData);
    // Do something with the converted JSON object, e.g., send it to an API
    jsonData = jsonData.map((v) => {
      v.tanggal = getDate(excelToJSDate(v.tanggal));
      return v;
    });
    setJson(jsonData);
    console.log(jsonData);
  };
  const handleButtonUploadExcelPress = async () => {
    if (json.length == 0) return alert("File belum dipilih");
    setReportList([]);
    try {
      const responses = await Promise.all(
        json.map((v) =>
          fetch(`${apiPath}proyek`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({ ...v, id_second: v.id }),
          })
        )
      );
      const dataArray = await Promise.all(
        responses.map((response) => response.json())
      );
      setReportList(dataArray.map((v, i) => `${i + 1}. ${v.message}`));
    } catch (e) {
      console.error(e);
    }
    setJson([]);
    report.onOpen();
  };
  const handleButtonExportToExcelPress = () => {
    const rows = proyek.data.map((v) => {
      const totalHarga = (v.hargakustom ?? v.hargajual) * v.jumlah;
      return v;
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.writeFile(
      workbook,
      `proyek_${getDateF(filter.startDate)}_${getDateF(filter.endDate)}.xlsx`,
      { compression: true }
    );
  };

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    const date = new Date(data.tanggal);
    const hutang = data.hutang ?? 0;
    switch (columnKey) {
      case "tanggal":
        return getDateF(new Date(data.tanggal));
      case "totalharga":
        return data.jumlah * data.harga;
      case "hutang":
        return (
          <div className="text-right">
            <Harga harga={+hutang} />
          </div>
        );
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <LinkOpenNewTab
              content="Detail"
              link={`/vendor/detail?id=${data.id}`}
              icon={<EyeIcon />}
            />
            <Tooltip content="Transfer">
              <span
                onClick={() => transferButtonPress(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <TransferIcon />
              </span>
            </Tooltip>
            <Tooltip content="Edit">
              <span
                onClick={() => editButtonPress(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete">
              <span
                onClick={() => deleteButtonPress(data.id)}
                className="text-lg text-danger cursor-pointer active:opacity-50"
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const transfer = useDisclosure();
  const report = useDisclosure();

  const data = vendor.data?.filter((row) =>
    row.nama.toLowerCase().includes(value.toLowerCase())
  );

  const pages = useMemo(() => {
    return data ? Math.ceil(data?.length / rowsPerPage) : 0;
  }, [data, rowsPerPage]);
  const loadingState = vendor.isLoading ? "loading" : "idle";
  const offset = (page - 1) * rowsPerPage;

  const columns = [
    {
      key: "id",
      label: "Id",
    },
    {
      key: "nama",
      label: "Nama",
    },
    {
      key: "hutang",
      label: "Hutang",
    },
    {
      key: "alamat",
      label: "Alamat",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-2">
        <Button color="primary" onPress={tambahButtonPress}>
          Tambah
        </Button>
        {/* <div>
          <Link
            className="bg-primary text-white p-2 rounded-lg inline-block"
            href={"/proyek.xlsx"}
          >
            Download Format
          </Link>
        </div>
        <FileUploader onFileUpload={handleFileUpload} />
        <Button color="primary" onPress={handleButtonUploadExcelPress}>
          Upload Excel
        </Button> */}
      </div>
      <Table
        isStriped
        className="pt-3"
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div>Filter</div>
            <Input
              label="Nama"
              placeholder="Masukkan nama!"
              value={value}
              onValueChange={setValue}
            />
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
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={data ? data.slice(offset, offset + rowsPerPage) : []}
          loadingContent={"Loading..."}
          loadingState={loadingState}
          emptyContent={"Kosong"}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.title} Vendor
              </ModalHeader>
              <ModalBody>
                {/* <Select
                  label="Swasta/Negri"
                  variant="bordered"
                  placeholder="Pilih swasta/negri!"
                  selectedKeys={form.isSwasta}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm({
                      ...form,
                      isSwasta: val,
                      swasta: new Set(val).values().next().value,
                    });
                  }}
                >
                  {isSwasta.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select> */}
                <Input
                  type="text"
                  label="Nama Vendor"
                  placeholder="Masukkan nama vendor!"
                  value={form.nama}
                  onValueChange={(val) => setForm({ ...form, nama: val })}
                />
                <Input
                  type="text"
                  label="Alamat"
                  placeholder="Masukkan alamat!"
                  value={form.alamat}
                  onValueChange={(val) => setForm({ ...form, alamat: val })}
                />
                {/* <Textarea
                  label="Keterangan"
                  labelPlacement="inside"
                  placeholder="Masukkan keterangan!"
                  value={form.keterangan}
                  onValueChange={(val) => setForm({ ...form, keterangan: val })}
                /> */}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => saveButtonPress(onClose)}
                >
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* transfer */}
      <Modal
        isOpen={transfer.isOpen}
        onOpenChange={transfer.onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Transfer Vendor
              </ModalHeader>
              <ModalBody>
                <Input
                  isDisabled
                  type="text"
                  label="Vendor asal"
                  defaultValue={form.nama}
                  className="max-w-xs"
                />
                <Select
                  label="Targer vendor"
                  variant="bordered"
                  placeholder="Pilih target vendor"
                  selectedKeys={form.selectedVendor}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm({
                      ...form,
                      selectedVendor: val,
                      vendor: new Set(val).values().next().value,
                    });
                  }}
                >
                  {vendor.data?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                {/* <Input
                  type="text"
                  label="Alamat"
                  placeholder="Masukkan alamat!"
                  value={form.alamat}
                  onValueChange={(val) => setForm({ ...form, alamat: val })}
                /> */}
                {/* <Textarea
                  label="Keterangan"
                  labelPlacement="inside"
                  placeholder="Masukkan keterangan!"
                  value={form.keterangan}
                  onValueChange={(val) => setForm({ ...form, keterangan: val })}
                /> */}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={transfer.onClose}
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => saveTransferButtonPress(transfer.onClose)}
                >
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* upload report */}
      <Modal
        isOpen={report.isOpen}
        onOpenChange={report.onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Hasil Upload
              </ModalHeader>
              <ModalBody>
                {reportList.map((r, i) => (
                  <div key={i}>{r}</div>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
