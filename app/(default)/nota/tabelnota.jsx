"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  User,
  Chip,
  Tooltip,
  ChipProps,
  getKeyValue,
} from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
} from "../../../components/icon";
import { useClientFetch, getApiPath } from "@/app/utils/apiconfig";
import { getDateF, getDate, getCurFirstLastDay } from "@/app/utils/date";
import { RangeDate } from "@/components/input";

const apiPath = getApiPath();
const [startDate, endDate] = getCurFirstLastDay();

export default function App() {
  const [current, setCurrent] = useState({
    startDate,
    endDate,
  });
  const nota = useClientFetch(
    `nota?start=${getDate(current.startDate)}&end=${getDate(current.endDate)}`
  );
  const karyawan = useClientFetch("karyawan");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [form, setForm] = useState({});
  const [method, setMethod] = useState("");

  const [page, setPage] = React.useState(1);
  const rowsPerPage = 25;

  const saveButtonPress = async (onClose) => {
    const res = await fetch(`${apiPath}nota`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    onClose();
    // return alert(json.message);
  };
  const tambahButtonPress = () => {
    setForm({
      modalmode: "Tambah",
      id: "",
      user: "",
      instansi: "",
      selectkaryawan: "",
      tanggal: "",
      startdate: "",
    });
    setMethod("POST");
    onOpen();
  };
  const editButtonPress = (data) => {
    const startdate = new Date(data.tanggal);
    setForm({
      ...data,
      modalmode: "Edit",
      tanggal: getDate(startdate),
      startdate,
      selectkaryawan: new Set([String(data.id_karyawan)]),
    });
    setMethod("PUT");
    onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus proyek?")) {
      const res = await fetch(`${apiPath}nota`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id }),
      });
      // return alert(await res.json().then((json) => json.message));
    }
  };
  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    const date = new Date(data.tanggal);
    switch (columnKey) {
      case "tanggal":
        return getDateF(new Date(data.tanggal));
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Detail">
              <Link href={`/nota/detail?id=${data.id}`}>
                <span
                  // onClick={() => detailButtonPress(data)}
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                  <EyeIcon />
                </span>
              </Link>
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

  const filteredData = nota?.data;
  const pages = useMemo(() => {
    return filteredData ? Math.ceil(filteredData?.length / rowsPerPage) : 0;
  }, [filteredData, rowsPerPage]);
  const loadingState = nota.isLoading ? "loading" : "idle";
  const offset = (page - 1) * rowsPerPage;

  if (nota.error) return <div>failed to load</div>;
  if (nota.isLoading) return <div>loading...</div>;
  if (karyawan.error) return <div>failed to load</div>;
  if (karyawan.isLoading) return <div>loading...</div>;
  const col = [
    {
      key: "id_kustom",
      label: "Id",
    },
    {
      key: "user",
      label: "User",
    },
    {
      key: "instansi",
      label: "Instansi",
    },
    {
      key: "tanggal",
      label: "Tanggal",
    },
    {
      key: "namakaryawan",
      label: "Karyawan",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];
  return (
    <div className="flex gap-2 flex-col">
      <div>
        <Button color="primary" onClick={tambahButtonPress}>
          Tambah
        </Button>
      </div>
      <Table
        className=""
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div>Filter</div>
            <div className="flex">
              <RangeDate current={current} setCurrent={setCurrent} />
            </div>
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
        <TableHeader columns={col}>
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
          items={
            filteredData ? filteredData.slice(offset, offset + rowsPerPage) : []
          }
          loadingContent={"Loading..."}
          emptyContent={"Kosong"}
          loadingState={loadingState}
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
                {form.modalmode} Nota
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="User"
                  placeholder="Masukkan user!"
                  value={form.user}
                  onValueChange={(val) => setForm({ ...form, user: val })}
                />
                <Input
                  type="text"
                  label="Instansi"
                  placeholder="Masukkan instansi!"
                  value={form.instansi}
                  onValueChange={(val) => setForm({ ...form, instansi: val })}
                />
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div>Tanggal</div>
                  <DatePicker
                    placeholderText="Pilih tanggal"
                    dateFormat="dd/MM/yyyy"
                    selected={form.startdate}
                    onChange={(v) =>
                      setForm({ ...form, startdate: v, tanggal: getDate(v) })
                    }
                  />
                </div>
                <Select
                  label="Karyawan"
                  variant="bordered"
                  placeholder="Pilih karyawan!"
                  selectedKeys={form.selectkaryawan}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm({
                      ...form,
                      selectkaryawan: val,
                      id_karyawan: new Set(val).values().next().value,
                    });
                  }}
                >
                  {karyawan.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
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
    </div>
  );
}
