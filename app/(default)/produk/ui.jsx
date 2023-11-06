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
import { Select, SelectItem } from "@nextui-org/react";
import "react-datepicker/dist/react-datepicker.css";
import { getApiPath, useClientFetch } from "../../utils/apiconfig";
import { Button } from "@nextui-org/react";
import { Input, Textarea } from "@nextui-org/react";

const apiPath = getApiPath();

export default function App() {
  const produk = useClientFetch("produk");
  const kategori = useClientFetch("kategoriproduk");
  const subkategori = useClientFetch("subkategoriproduk");
  const merek = useClientFetch("merek");
  const [method, setMethod] = useState("POST");
  const [form, setForm] = useState({});
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
    setForm({
      modalmode: "Tambah",
      id: "",
      nama: "",
      id_kategori: "",
      id_subkategori: "",
      id_merek: "",
      tipe: "",
      jumlah: "",
      satuan: "",
      select_kategori: new Set([]),
      select_subkategori: new Set([]),
      select_merek: new Set([]),
      filteredsubkategori: [],
      keterangan: "",
    });
    setMethod("POST");
    onOpen();
  };
  const editButtonPress = (data) => {
    setForm({
      ...data,
      modalmode: "Edit",
      select_kategori: new Set([String(data.id_kategori)]),
      select_subkategori: new Set([String(data.id_subkategori)]),
      select_merek: new Set([String(data.id_merek)]),
    });
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

  if (produk.error) return <div>failed to load</div>;
  if (produk.isLoading) return <div>loading...</div>;
  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  if (subkategori.error) return <div>failed to load</div>;
  if (subkategori.isLoading) return <div>loading...</div>;
  if (merek.error) return <div>failed to load</div>;
  if (merek.isLoading) return <div>loading...</div>;

  const col = [
    {
      key: "nama",
      label: "Nama",
    },
    {
      key: "id_kategori",
      label: "Id Kategori",
    },
    {
      key: "id_subkategori",
      label: "Id Subkategori",
    },
    {
      key: "id_merek",
      label: "Id Merek",
    },
    {
      key: "tipe",
      label: "Tipe",
    },
    {
      key: "jumlah",
      label: "Jumlah",
    },
    {
      key: "satuan",
      label: "Satuan",
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

  let filteredsubkategori = [
    { nama: "Silahkan pilih kategori terlebih dahulu" },
  ];
  if (form.id_kategori) {
    filteredsubkategori = subkategori.data.filter((item) => {
      if (item.id_kategoriproduk == form.id_kategori) return item;
    });
  }

  return (
    <div className="flex-col">
      <Button className="bg-background" onPress={tambahButtonPress}>
        Tambah
      </Button>
      <Table className="pt-3" aria-label="Example table with custom cells">
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
        <TableBody items={produk.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.modalmode} Produk
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Nama"
                  placeholder="Masukkan nama!"
                  value={form.nama}
                  onValueChange={(val) => setForm({ ...form, nama: val })}
                />
                <Select
                  label="Kategori"
                  placeholder="Pilih Kategori"
                  className="max-w-xs"
                  selectedKeys={form.select_kategori}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_kategori: e.target.value,
                      select_kategori: new Set([e.target.value]),
                      filteredsubkategori: subkategori.data.filter((item) => {
                        if (item.id_kategoriproduk == e.target.value) {
                          return item;
                        }
                      }),
                    })
                  }
                >
                  {kategori.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Subkategori"
                  placeholder="Pilih Subkategori"
                  className="max-w-xs"
                  selectedKeys={form.select_subkategori}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_subkategori: e.target.value,
                      select_subkategori: new Set([e.target.value]),
                    })
                  }
                >
                  {filteredsubkategori.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Merek"
                  placeholder="Pilih Merek"
                  className="max-w-xs"
                  selectedKeys={form.select_merek}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_merek: e.target.value,
                      select_merek: new Set([e.target.value]),
                    })
                  }
                >
                  {merek.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  type="text"
                  label="Tipe"
                  placeholder="Masukkan tipe!"
                  value={form.tipe}
                  onValueChange={(val) => setForm({ ...form, tipe: val })}
                />
                <Input
                  isDisabled
                  type="number"
                  label="Jumlah"
                  placeholder="Masukkan jumlah!"
                  value={form.jumlah}
                  onValueChange={(val) => setForm({ ...form, jumlah: val })}
                />
                <Input
                  type="text"
                  label="Satuan"
                  placeholder="Masukkan satuan!"
                  value={form.satuan}
                  onValueChange={(val) => setForm({ ...form, satuan: val })}
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
    </div>
  );
}
