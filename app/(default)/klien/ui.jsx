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
} from "../../components/icon";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import "react-datepicker/dist/react-datepicker.css";
import { getApiPath, useClientFetch } from "../../utils/apiconfig";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";

const api_path = getApiPath();

export default function app() {
  const klien = useClientFetch(`klien`);
  const [form, setForm] = useState({});
  const [method, setMethod] = useState();
  const tambahButtonPress = () => {
    setForm({
      id: "",
      nama: "",
      alamat: "",
      modalmode: "Tambah",
    });
    setMethod("POST");
    modal.klien.onOpen();
  };
  const editButtonPress = (data) => {
    const date = new Date(data.tanggal);
    setForm({
      ...data,
      modalmode: "Edit",
    });
    setMethod("PUT");
    modal.klien.onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus klien?")) {
      const res = await fetch(`${api_path}klien`, {
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
    const res = await fetch(`${api_path}klien`, {
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
    klien: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      const date = new Date(data.tanggal);
      switch (columnKey) {
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
    klien: [
      {
        key: "nama",
        label: "Nama",
      },
      {
        key: "alamat",
        label: "Alamat",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
  };
  const modal = {
    klien: useDisclosure(),
  };

  if (klien.error) return <div>failed to load</div>;
  if (klien.isLoading) return <div>loading...</div>;

  return (
    <div>
      <Button onClick={tambahButtonPress} color="primary">
        Tambah
      </Button>
      <Table className="pt-3" aria-label="Example table with custom cells">
        <TableHeader columns={col.klien}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={klien.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell.klien(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.klien.isOpen}
        onOpenChange={modal.klien.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.modalmode} Distributor
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Nama"
                  placeholder="Masukkan nama"
                  value={form.nama}
                  onValueChange={(v) => setForm({ ...form, nama: v })}
                />
                <Input
                  type="text"
                  label="Alamat"
                  placeholder="Masukkan alamat"
                  value={form.alamat}
                  onValueChange={(v) => setForm({ ...form, alamat: v })}
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
