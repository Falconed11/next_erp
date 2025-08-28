"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
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
} from "@heroui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
} from "@/components/icon";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import "react-datepicker/dist/react-datepicker.css";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import { rolesCheck } from "@/app/utils/tools";
import { Button } from "@heroui/react";
import { Input, Textarea } from "@heroui/react";

const api_path = getApiPath();

export default function App() {
  const session = useSession();

  const perusahaan = useClientFetch(`perusahaan`);
  const [form, setForm] = useState({});
  const [method, setMethod] = useState();
  const tambahButtonPress = () => {
    setForm({});
    setMethod("POST");
    modal.perusahaan.onOpen();
  };
  const editButtonPress = (data) => {
    const date = new Date(data.tanggal);
    setForm({
      ...data,
    });
    setMethod("PUT");
    modal.perusahaan.onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus perusahaan?")) {
      const res = await fetch(`${api_path}perusahaan`, {
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
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "newLogo") formData.append(key, value);
    });
    formData.append("file", data.newLogo);
    const res = await fetch(`${api_path}perusahaan`, {
      method,
      body: formData,
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    perusahaan.mutate();
    modal.perusahaan.onClose();
    // return alert(json.message);
  };
  const renderCell = {
    perusahaan: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      const date = new Date(data.tanggal);
      switch (columnKey) {
        case "logo":
          return (
            <Image src={data.logo} alt="Company Logo" width={40} height={40} />
          );
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
    perusahaan: [
      {
        key: "nama",
        label: "Nama",
      },
      {
        key: "logo",
        label: "Logo",
      },
      {
        key: "deskripsi",
        label: "Deskripsi",
      },
      {
        key: "alamat",
        label: "Alamat",
      },
      {
        key: "kontak",
        label: "Kontak",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
  };
  const modal = {
    perusahaan: useDisclosure(),
  };

  if (perusahaan.error) return <div>failed to load</div>;
  if (perusahaan.isLoading) return <div>loading...</div>;
  if (session.status === "loading") return <>Loading...</>;
  if (!rolesCheck(["admin", "super"], session.data.user.peran))
    return <div>Anda tidak memiliki akses pada laman ini.</div>;
  console.log(form);
  return (
    <div>
      <Button onPress={tambahButtonPress} color="primary">
        Tambah
      </Button>
      <Table className="pt-3" aria-label="Example table with custom cells">
        <TableHeader columns={col.perusahaan}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={perusahaan.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell.perusahaan(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.perusahaan.isOpen}
        onOpenChange={modal.perusahaan.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.modalmode} Perusahaan
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Nama"
                  placeholder="Masukkan nama"
                  value={form.nama}
                  onValueChange={(v) => setForm({ ...form, nama: v })}
                />
                <Image
                  src={
                    form.newLogo ? URL.createObjectURL(form.newLogo) : form.logo
                  }
                  alt="Preview Logo"
                  width={40}
                  height={40}
                />
                <Input
                  type="file"
                  label="Logo"
                  accept="image/*"
                  placeholder="Masukkan logo!"
                  onChange={(e) =>
                    setForm({ ...form, newLogo: e.target.files[0] })
                  }
                />
                <Textarea
                  label="Deskripsi"
                  labelPlacement="inside"
                  placeholder="Masukkan deskripsi!"
                  value={form.deskripsi}
                  onValueChange={(v) => setForm({ ...form, deskripsi: v })}
                />
                <Textarea
                  label="Alamat"
                  labelPlacement="inside"
                  placeholder="Masukkan alamat!"
                  value={form.alamat}
                  onValueChange={(v) => setForm({ ...form, alamat: v })}
                />
                <Textarea
                  label="Kontak"
                  labelPlacement="inside"
                  placeholder="Masukkan kontak!"
                  value={form.kontak}
                  onValueChange={(v) => setForm({ ...form, kontak: v })}
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
