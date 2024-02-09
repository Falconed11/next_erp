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
import "react-datepicker/dist/react-datepicker.css";
import { getApiPath, useClientFetch } from "../../utils/apiconfig";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";

const api_path = getApiPath();

export default function App() {
  const user = useClientFetch(`user`);
  const [form, setForm] = useState({});
  const [method, setMethod] = useState();
  const tambahButtonPress = () => {
    setForm({
      id: "",
      username: "",
      peran: "",
      password: "",
      ulangipassword: "",
      modalmode: "Tambah",
    });
    setMethod("POST");
    modal.user.onOpen();
  };
  const editButtonPress = (data) => {
    const date = new Date(data.tanggal);
    setForm({
      ...data,
      passwordlama: "",
      password: "",
      ulangipassword: "",
      modalmode: "Edit",
    });
    setMethod("PUT");
    modal.user.onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus user?")) {
      const res = await fetch(`${api_path}user`, {
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
    if (data.password != data.ulangipassword)
      return alert("Ulangi Password tidak sesuai");
    const res = await fetch(`${api_path}user`, {
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
    user: React.useCallback((data, columnKey) => {
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
    user: [
      {
        key: "username",
        label: "Username",
      },
      {
        key: "peran",
        label: "Peran",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
  };
  const modal = {
    user: useDisclosure(),
  };

  if (user.error) return <div>failed to load</div>;
  if (user.isLoading) return <div>loading...</div>;

  return (
    <div>
      <Button onClick={tambahButtonPress} color="primary">
        Tambah
      </Button>
      <Table className="pt-3" aria-label="Example table with custom cells">
        <TableHeader columns={col.user}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={user.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell.user(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.user.isOpen}
        onOpenChange={modal.user.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.modalmode} User
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Username"
                  placeholder="Masukkan username"
                  value={form.username}
                  onValueChange={(v) => setForm({ ...form, username: v })}
                />
                <Input
                  type="text"
                  label="Peran"
                  placeholder="Masukkan peran"
                  value={form.peran}
                  onValueChange={(v) => setForm({ ...form, peran: v })}
                />
                {form.modalmode == "Tambah" ? (
                  <>
                    <Input
                      type="password"
                      label="Password"
                      placeholder="Masukkan password"
                      value={form.password}
                      onValueChange={(v) => setForm({ ...form, password: v })}
                    />
                    <Input
                      type="password"
                      label="Ulangi Password"
                      placeholder="Masukkan password"
                      value={form.ulangipassword}
                      onValueChange={(v) =>
                        setForm({ ...form, ulangipassword: v })
                      }
                    />
                  </>
                ) : (
                  <>
                    <Input
                      type="password"
                      label="Password Lama"
                      placeholder="Masukkan password"
                      value={form.passwordlama}
                      onValueChange={(v) =>
                        setForm({ ...form, passwordlama: v })
                      }
                    />
                    <Input
                      type="password"
                      label="Password Baru"
                      placeholder="Masukkan password"
                      value={form.password}
                      onValueChange={(v) => setForm({ ...form, password: v })}
                    />
                    <Input
                      type="password"
                      label="Ulangi Password Baru"
                      placeholder="Masukkan password"
                      value={form.ulangipassword}
                      onValueChange={(v) =>
                        setForm({ ...form, ulangipassword: v })
                      }
                    />
                  </>
                )}
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
