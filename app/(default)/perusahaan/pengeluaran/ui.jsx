"use client";
import React, { useState } from "react";
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
  ChipProps,
  getKeyValue,
} from "@nextui-org/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
} from "../../../components/icon";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getApiPath, useClientFetch } from "../../../utils/apiconfig";
import { getDate } from "../../../utils/date";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";

const api_path = getApiPath();

export default function app() {
  const pengeluaranperusahaan = useClientFetch(`pengeluaranperusahaan`);
  const distributor = useClientFetch(`distributor`);
  const [form, setForm] = useState({});
  const [method, setMethod] = useState();
  const tambahButtonPress = () => {
    setForm({
      modalmode: "Tambah",
      id: "",
      id_distributor: "",
      id_kategori: "",
      tanggal: "",
      startDate: "",
      nominal: "",
      keterangan: "",
      select_distributor: new Set([]),
      select_kategori: new Set([]),
    });
    setMethod("POST");
    modal.pengeluaranperusahaan.onOpen();
  };
  const editButtonPress = (data) => {
    const date = new Date(data.tanggal);
    setForm({
      ...data,
      modalmode: "Edit",
      select_distributor: new Set([String(data.id_distributor)]),
      select_kategori: new Set([String(data.id_kategori)]),
      startDate: date,
      tanggal: getDate(date),
    });
    setMethod("PUT");
    modal.pengeluaranperusahaan.onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus produk?")) {
      const res = await fetch(`${api_path}pengeluaranperusahaan`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      return alert(json.message);
    }
  };
  const simpanButtonPress = async (data) => {
    const res = await fetch(`${api_path}pengeluaranperusahaan`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return alert(json.message);
  };
  const renderCell = {
    pengeluaranperusahaan: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      const date = new Date(data.tanggal);
      switch (columnKey) {
        case "tanggal":
          return getDate(date);
        case "aksi":
          return (
            <div className="relative flex items-center gap-2">
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
    }, []),
  };
  const col = {
    pengeluaranperusahaan: [
      {
        key: "id_distributor",
        label: "Id Distributor",
      },
      {
        key: "id_kategori",
        label: "Id Kategori",
      },
      {
        key: "tanggal",
        label: "Tanggal",
      },
      {
        key: "nominal",
        label: "nominal",
      },
      {
        key: "keterangan",
        label: "Keterangan",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
  };
  const select = {
    kategori: [
      {
        key: 1,
        label: 1,
      },
      {
        key: 2,
        label: 2,
      },
    ],
  };
  const modal = {
    pengeluaranperusahaan: useDisclosure(),
  };

  if (pengeluaranperusahaan.error) return <div>failed to load</div>;
  if (pengeluaranperusahaan.isLoading) return <div>loading...</div>;
  if (distributor.error) return <div>failed to load</div>;
  if (distributor.isLoading) return <div>loading...</div>;

  return (
    <div>
      <Button onClick={tambahButtonPress} color="primary">
        Tambah
      </Button>
      <Table className="pt-3" aria-label="Example table with custom cells">
        <TableHeader columns={col.pengeluaranperusahaan}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={pengeluaranperusahaan.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell.pengeluaranperusahaan(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.pengeluaranperusahaan.isOpen}
        onOpenChange={modal.pengeluaranperusahaan.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.modalmode} Pengeluaran
              </ModalHeader>
              <ModalBody>
                <Select
                  label="Id Distributor"
                  placeholder="Pilih distributor"
                  className="max-w-xs"
                  selectedKeys={form.select_distributor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_distributor: e.target.value,
                      select_distributor: new Set([e.target.value]),
                    })
                  }
                >
                  {distributor.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Id Kategori"
                  placeholder="Pilih kategori"
                  className="max-w-xs"
                  selectedKeys={form.select_kategori}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_kategori: e.target.value,
                      select_kategori: new Set([e.target.value]),
                    })
                  }
                >
                  {select.kategori.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      {String(item.label)}
                    </SelectItem>
                  ))}
                </Select>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div>Tanggal</div>
                  <DatePicker
                    placeholderText="Pilih tanggal"
                    dateFormat="dd/MM/yyyy"
                    selected={form.startDate}
                    onChange={(v) =>
                      setForm({ ...form, startDate: v, tanggal: getDate(v) })
                    }
                  />
                  <div>Tanggal : {form.tanggal}</div>
                </div>
                <Input
                  type="number"
                  label="Nominal"
                  placeholder="Masukkan nominal"
                  value={form.nominal}
                  onValueChange={(v) => setForm({ ...form, nominal: v })}
                />
                <Textarea
                  label="Keterangan"
                  labelPlacement="inside"
                  placeholder="Masukkan keterangan"
                  value={form.keterangan}
                  onValueChange={(v) => setForm({ ...form, keterangan: v })}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={() => simpanButtonPress(form)}>
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
