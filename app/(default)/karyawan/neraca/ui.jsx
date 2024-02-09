"use client";
import React, { useState } from "react";
import Image from "next/image";
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
} from "../../../../components/icon";
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
import imageCompression from "browser-image-compression";

const api_path = getApiPath();

export default function App() {
  const pengeluaran = useClientFetch(`pengeluaran`);
  const karyawan = useClientFetch(`karyawan`);
  const proyek = useClientFetch(`proyek`);
  const [form, setForm] = useState({});
  const [method, setMethod] = useState();
  const tambahButtonPress = () => {
    setForm({
      id: "",
      id_karyawan: "",
      id_proyek: "",
      id_kategori: "",
      tanggal: "",
      startDate: "",
      harga: "",
      keterangan: "",
      files: [],
      select_karyawan: new Set([]),
      select_proyek: new Set([]),
    });
    setMethod("POST");
    modal.pengeluaran.onOpen();
  };
  const editButtonPress = (data) => {
    const date = new Date(data.tanggal);
    setForm({
      ...data,
      select_karyawan: new Set([String(data.id_karyawan)]),
      select_proyek: new Set([String(data.id_proyek)]),
      startDate: date,
      tanggal: getDate(date),
    });
    setMethod("PUT");
    modal.pengeluaran.onOpen();
    return;
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus produk?")) {
      const res = await fetch(`${api_path}pengeluaran`, {
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
    formData.append("file", form.file);
    formData.append("id_karyawan", form.id_karyawan);

    const res = await fetch(`${api_path}nota`, {
      method,
      // headers: {
      //   "Content-Type": "application/json",
      //   // 'Content-Type': 'application/x-www-form-urlencoded',
      // },
      body: formData,
    });
    const json = await res.json();
    return alert(json.message);
  };
  const renderCell = {
    pengeluaran: React.useCallback((data, columnKey) => {
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
    pengeluaran: [
      {
        key: "tanggal",
        label: "Tanggal",
      },
      {
        key: "keterangan",
        label: "Keterangan",
      },
      {
        key: "masuk",
        label: "Masuk",
      },
      {
        key: "keluar",
        label: "Keluar",
      },
      {
        key: "nota",
        label: "Nota",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
  };
  const modal = {
    pengeluaran: useDisclosure(),
  };

  if (pengeluaran.error) return <div>failed to load</div>;
  if (pengeluaran.isLoading) return <div>loading...</div>;
  if (karyawan.error) return <div>failed to load</div>;
  if (karyawan.isLoading) return <div>loading...</div>;
  if (proyek.error) return <div>failed to load</div>;
  if (proyek.isLoading) return <div>loading...</div>;

  return (
    <div>
      <Button onClick={tambahButtonPress} color="primary">
        Tambah
      </Button>
      <Table
        className="pt-3"
        aria-label="Example table with custom cells"
        bottomContent={<div>Jumlah</div>}
      >
        <TableHeader columns={col.pengeluaran}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={pengeluaran.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell.pengeluaran(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.pengeluaran.isOpen}
        onOpenChange={modal.pengeluaran.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Pengeluaran
              </ModalHeader>
              <ModalBody>
                <div>
                  Nota
                  <Image width="300" src={form.compressedFile} />
                  <input
                    type="file"
                    accept="image/*"
                    label="Gambar"
                    // placeholder="Upload gambar"
                    // value={form.files[0]}
                    onChange={async (v) => {
                      if (v.target.files && v.target.files[0]) {
                        const i = v.target.files[0];
                        const options = {
                          maxSizeMB: 0.1,
                        };
                        let compressedFile = null;
                        try {
                          compressedFile = await imageCompression(i, options);
                          console.log(
                            "compressedFile instanceof Blob",
                            compressedFile instanceof Blob
                          ); // true
                          console.log(
                            `compressedFile size ${
                              compressedFile.size / 1024 / 1024
                            } MB`
                          ); // smaller than maxSizeMB

                          // await uploadToServer(compressedFile); // write your own logic
                          console.log(new File(compressedFile, "new.jpeg"));
                        } catch (error) {
                          console.log(error);
                        }
                        console.log(i);
                        setForm({
                          ...form,
                          file: compressedFile,
                          createObjectURL: URL.createObjectURL(i),
                          compressedFile: URL.createObjectURL(compressedFile),
                        });
                      }
                    }}
                  />
                </div>
                <Select
                  label="Nama Karyawan"
                  placeholder="Pilih karyawan"
                  className="max-w-xs"
                  selectedKeys={form.select_karyawan}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_karyawan: e.target.value,
                      select_karyawan: new Set([e.target.value]),
                    })
                  }
                >
                  {karyawan.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Id Proyek"
                  placeholder="Pilih proyek"
                  className="max-w-xs"
                  selectedKeys={form.select_proyek}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_proyek: e.target.value,
                      select_proyek: new Set([e.target.value]),
                    })
                  }
                >
                  {proyek.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {String(item.id)}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Nama Proyek"
                  placeholder="Pilih proyek"
                  className="max-w-xs"
                  selectedKeys={form.select_proyek}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_proyek: e.target.value,
                      select_proyek: new Set([e.target.value]),
                    })
                  }
                >
                  {proyek.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
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
                  label="Harga"
                  placeholder="Masukkan harga"
                  value={form.harga}
                  onValueChange={(v) => setForm({ ...form, harga: v })}
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
