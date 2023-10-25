"use client";
import React, { useState } from "react";
import { useClientFetch, getApiPath } from "../../utils/apiconfig";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";

import { EditIcon, DeleteIcon, EyeIcon } from "../../components/icon";

const apiPath = getApiPath();
export default function App() {
  const { data, error, isLoading } = useClientFetch("produk");
  const [method, setMethod] = useState("POST");
  const saveButtonPress = async () => {
    if (form.nama == "" || form.kategori == "")
      return alert("Nama, dan Kategori harus diisi!");
    const res = await fetch(`${apiPath}produk`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    return alert(json.message);
  };
  const tambahButtonPress = () => {
    setForm({ id: "", nama: "", kategori: "", keterangan: "" });
    setMethod("POST");
    onOpen();
  };
  const editButtonPress = (selecteddata) => {
    setForm(selecteddata);
    setMethod("PUT");
    onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus product?")) {
      const res = await fetch(`${apiPath}produk`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id }),
      });
      return alert(await res.json().then((json) => json.message));
    }
  };
  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EyeIcon />
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
  const [form, setForm] = useState({
    id: "",
    nama: "",
    kategori: "",
    keterangan: "",
  });

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  const columns = [
    {
      key: "nama",
      label: "Nama",
    },
    {
      key: "kategori",
      label: "Kategori",
    },
    {
      key: "keterangan",
      label: "Keterangan",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];
  const modaltitle = method == "POST" ? "Tambah Produk" : "Edit Produk";

  return (
    <div className="flex-col">
      <Button className="bg-background" onPress={tambahButtonPress}>
        Tambah
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {modaltitle}
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Nama"
                  placeholder="Masukkan nama!"
                  value={form.nama}
                  onValueChange={(val) => setForm({ ...form, nama: val })}
                />
                <Input
                  type="text"
                  label="Kategori"
                  placeholder="Masukkan kategori!"
                  value={form.kategori}
                  onValueChange={(val) => setForm({ ...form, kategori: val })}
                />
                <Textarea
                  label="Keterangan"
                  labelPlacement="inside"
                  placeholder="Masukkan keterangan!"
                  value={form.keterangan}
                  onValueChange={(val) => setForm({ ...form, keterangan: val })}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={saveButtonPress}>
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Table className="pt-3" aria-label="Example table with custom cells">
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
        <TableBody items={data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
