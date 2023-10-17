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
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import Link from "next/link";
import { getApiPath, useClientFetch } from "../../utils/apiconfig";

const api_path = getApiPath();

export default function app({ proyek, id }) {
  const keranjangProyek = useClientFetch(`keranjangproyek?id_proyek=${id}`);
  const [tempProyek, setTempProyek] = useState(proyek);
  const [hargaJual, setHargaJual] = useState(0);
  const [form, setForm] = useState({});
  const editButtonPress = (data) => {
    setForm({ ...data, profit: data.hargajual - data.harga });
    modal.produk.onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus produk?")) {
      const res = await fetch(`${api_path}keranjangproyek`, {
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
    const res = await fetch(`${api_path}keranjangproyek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id: data.id_keranjangproyek,
        jumlah: data.jumlah,
        harga: data.hargajual,
      }),
    });
    const json = await res.json();
    return alert(json.message);
  };
  const renderCell = {
    stok: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "totalharga-beli":
          return data.jumlah * data.harga;
        case "totalharga-jual":
          return data.jumlah * data.hargajual;
        case "profit":
          return data.hargajual - data.harga;
        case "totalprofit":
          return data.jumlah * data.hargajual - data.jumlah * data.harga;
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
                  onClick={() => deleteButtonPress(data.id_keranjangproyek)}
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
  const modal = {
    produk: useDisclosure(),
    invoice: useDisclosure(),
  };
  const col = {
    keranjangproyek: [
      {
        key: "nama",
        label: "Nama",
      },
      {
        key: "merek",
        label: "Merek",
      },
      {
        key: "tipe",
        label: "Tipe",
      },
      {
        key: "satuan",
        label: "Satuan",
      },
      {
        key: "stok",
        label: "Stok",
      },
      {
        key: "jumlah",
        label: "Jumlah",
      },
      {
        key: "harga",
        label: "Harga Beli",
      },
      {
        key: "hargajual",
        label: "Harga Jual",
      },
      {
        key: "totalharga-beli",
        label: "Total Harga Beli",
      },
      {
        key: "totalharga-jual",
        label: "Total Harga Jual",
      },
      {
        key: "profit",
        label: "Profit",
      },
      {
        key: "totalprofit",
        label: "Total Profit",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
  };

  if (keranjangProyek.error) return <div>failed to load</div>;
  if (keranjangProyek.isLoading) return <div>loading...</div>;

  return (
    <div>
      <div className="flex flex-row">
        <div className="bg-white rounded-lg p-3">
          <div>Nama: {tempProyek.nama} </div>
          <div>Klien: {tempProyek.klien} </div>
          <div>Status: {tempProyek.status} </div>
        </div>
      </div>
      <div>
        <Button onClick={modal.invoice.onOpen} color="primary" className="mt-3">
          Invoice
        </Button>
      </div>
      <Table
        topContent={
          <>
            <div>Produk</div>
            <div>
              <Link href={`/stok?id_proyek=${proyek.id}`}>
                <Button color="primary">Tambah</Button>
              </Link>
            </div>
          </>
        }
        className="pt-3"
        aria-label="Example table with custom cells"
      >
        <TableHeader columns={col.keranjangproyek}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={keranjangProyek.data}>
          {(item) => (
            <TableRow key={item.id_keranjangproyek}>
              {(columnKey) => (
                <TableCell>{renderCell.stok(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.produk.isOpen}
        onOpenChange={modal.produk.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Produk
              </ModalHeader>
              <ModalBody>
                <div>Nama : {form.nama}</div>
                <div>Merek : {form.merek}</div>
                <div>Tipe : {form.tipe}</div>
                <div>Satuan : {form.satuan}</div>
                <div>Stok : {form.stok}</div>
                <div>
                  <div>Jumlah : </div>
                  <div>
                    <Input
                      type="number"
                      value={form.jumlah}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          jumlah: v,
                        })
                      }
                    />
                  </div>
                </div>
                <div>Harga Beli : {form.harga}</div>
                <div>
                  <div>Harga Jual : </div>
                  <div>
                    <Input
                      type="number"
                      value={form.hargajual}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          hargajual: v,
                          profit: parseInt(v) - form.harga,
                        })
                      }
                    />
                  </div>
                </div>
                <div>Total Harga Beli : {form.harga}</div>
                <div>Total Harga Jual : {form.hargajual * form.jumlah}</div>
                <div>
                  <div>Profit : </div>
                  <div>
                    <Input
                      type="number"
                      value={form.profit}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          profit: v,
                          hargajual: form.harga + parseInt(v),
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  Total Profit : {(form.hargajual - form.harga) * form.jumlah}
                </div>
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
      <Modal
        scrollBehavior="inside"
        isOpen={modal.invoice.isOpen}
        onOpenChange={modal.invoice.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Invoice</ModalHeader>
              <ModalBody>
                <div>Nama : {form.nama}</div>
                <div>Merek : {form.merek}</div>
                <div>Tipe : {form.tipe}</div>
                <div>Satuan : {form.satuan}</div>
                <div>Stok : {form.stok}</div>
                <div>
                  <div>Jumlah : </div>
                  <div>
                    <Input
                      type="number"
                      value={form.jumlah}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          jumlah: v,
                        })
                      }
                    />
                  </div>
                </div>
                <div>Harga Beli : {form.harga}</div>
                <div>
                  <div>Harga Jual : </div>
                  <div>
                    <Input
                      type="number"
                      value={form.hargajual}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          hargajual: v,
                          profit: parseInt(v) - form.harga,
                        })
                      }
                    />
                  </div>
                </div>
                <div>Total Harga Beli : {form.harga}</div>
                <div>Total Harga Jual : {form.hargajual * form.jumlah}</div>
                <div>
                  <div>Profit : </div>
                  <div>
                    <Input
                      type="number"
                      value={form.profit}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          profit: v,
                          hargajual: form.harga + parseInt(v),
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  Total Profit : {(form.hargajual - form.harga) * form.jumlah}
                </div>
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
