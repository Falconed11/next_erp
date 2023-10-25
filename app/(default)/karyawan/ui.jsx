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
import { getApiPath, useClientFetch } from "../../utils/apiconfig";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";

const api_path = getApiPath();

export default function app() {
  const karyawan = useClientFetch(`karyawan`);
  const [form, setForm] = useState({});
  const [method, setMethod] = useState();
  const tambahButtonPress = () => {
    setForm({ id: "", nama: "" });
    setMethod("POST");
    modal.karyawan.onOpen();
  };
  const editButtonPress = (data) => {
    setForm(data);
    setMethod("PUT");
    modal.karyawan.onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus produk?")) {
      const res = await fetch(`${api_path}karyawan`, {
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
    const res = await fetch(`${api_path}karyawan`, {
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
    karyawan: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "totalharga-beli":
          return data.jumlah * data.harga;
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
    invoice: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "total":
          return data.jumlah * data.harga;
        default:
          return cellValue;
      }
    }, []),
  };
  const col = {
    karyawan: [
      {
        key: "nama",
        label: "Nama",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
  };
  const modal = {
    karyawan: useDisclosure(),
  };

  if (karyawan.error) return <div>failed to load</div>;
  if (karyawan.isLoading) return <div>loading...</div>;

  return (
    <div>
      <Button onClick={tambahButtonPress} color="primary">
        Tambah
      </Button>
      <Table className="pt-3" aria-label="Example table with custom cells">
        <TableHeader columns={col.karyawan}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={karyawan.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell.karyawan(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.karyawan.isOpen}
        onOpenChange={modal.karyawan.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Produk
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Nama"
                  placeholder="Masukkan nama!"
                  value={form.nama}
                  onValueChange={(val) => setForm({ ...form, nama: val })}
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
