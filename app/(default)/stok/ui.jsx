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
import { Input, Select, SelectItem } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import Link from "next/link";
import { AddIcon, EditIcon, DeleteIcon, EyeIcon } from "../../components/icon";

const apiPath = getApiPath();

export default function App({ id_proyek }) {
  const stok = useClientFetch("stok");
  const produk = useClientFetch("produk");
  const [method, setMethod] = useState("POST");
  const [form, setForm] = useState({});
  const saveButtonPress = async () => {
    // if (form.nama == "" || form.kategori == "")
    //   return alert("Nama, dan Kategori harus diisi!");
    const res = await fetch(`${apiPath}stok`, {
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
      merek: "",
      tipe: "",
      satuan: "",
      harga: "",
      jumlah: "",
      id_produk: "",
      id_gudang: "",
      id_distributor: "",
      tanggal: "",
      jatuhtempo: "",
      keterangan: "",
      select_produk: new Set([]),
    });
    setMethod("POST");
    onOpen();
  };
  const editButtonPress = (data) => {
    setForm({ ...data, modalmode: "Edit" });
    setMethod("PUT");
    onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus product?")) {
      const res = await fetch(`${apiPath}stok`, {
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
      case "totalharga":
        return data.jumlah * data.harga;
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <TambahButton id_proyek={id_proyek} id_stok={data.id} />
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

  if (stok.error) return <div>failed to load</div>;
  if (stok.isLoading) return <div>loading...</div>;
  if (produk.error) return <div>failed to load</div>;
  if (produk.isLoading) return <div>loading...</div>;

  const columns = [
    {
      key: "kategori",
      label: "Kategori",
    },
    {
      key: "subkategori",
      label: "Subkategori",
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
      key: "harga",
      label: "Harga",
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
      key: "totalharga",
      label: "Total Harga",
    },
    {
      key: "terbayar",
      label: "Terbayar",
    },
    {
      key: "tanggalbeli",
      label: "Tanggal Beli",
    },
    {
      key: "jatuhtempo",
      label: "Jatuh Tempo",
    },
    {
      key: "distributor",
      label: "Distributor",
    },
    {
      key: "gudang",
      label: "Gudang",
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
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.modalmode} Stok
              </ModalHeader>
              <ModalBody>
                <Select
                  label="Produk"
                  placeholder="Pilih produk"
                  className="max-w-xs"
                  selectedKeys={form.select_produk}
                  onChange={(e) => {
                    let selectedproduk = {
                      kategori: 0,
                      subkategori: 0,
                      merek: 0,
                      tipe: "",
                      satuan: "",
                      jumlah: "",
                    };
                    if (e.target.value) {
                      selectedproduk = produk.data.filter((item) => {
                        if (item.id == e.target.value) return item;
                      })[0];
                    }
                    console.log(selectedproduk);
                    return setForm({
                      ...form,
                      id_produk: e.target.value,
                      select_produk: new Set([e.target.value]),
                      kategori: selectedproduk.id_kategori,
                      subkategori: selectedproduk.id_subkategori,
                      merek: selectedproduk.id_merek,
                      tipe: selectedproduk.tipe,
                      satuan: selectedproduk.satuan,
                      jumlah: selectedproduk.jumlah,
                    });
                  }}
                >
                  {produk.data.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      textValue={item.nama}
                    >
                      {item.nama} | {String(item.id_kategori)} |{" "}
                      {String(item.id_subkategori)} | {String(item.id_merek)} |{" "}
                      {item.satuan} | Stok: {item.jumlah}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  isReadOnly
                  type="text"
                  label="Kategori"
                  value={form.kategori}
                />
                <Input
                  isReadOnly
                  type="text"
                  label="Subkategori"
                  value={form.subkategori}
                />
                <Input
                  isReadOnly
                  type="text"
                  label="Merek"
                  value={form.merek}
                />
                <Input isReadOnly type="text" label="Tipe" value={form.tipe} />
                <Input
                  isReadOnly
                  type="text"
                  label="Satuan"
                  value={form.satuan}
                />
                <Input
                  isReadOnly
                  type="number"
                  label="Stok"
                  value={form.jumlah}
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
        <TableBody items={stok.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div>
        <div className="mt-3">
          <KembaliButton id_proyek={id_proyek} />
        </div>
      </div>
    </div>
  );
}

function TambahButton({ id_proyek, id_stok }) {
  const tambahButtonPress = async () => {
    const res = await fetch(`${apiPath}keranjangproyek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({ id_proyek, id_stok }),
    });
    const json = await res.json();
    return alert(json.message);
  };
  if (id_proyek)
    return (
      <>
        <Tooltip content="Tambah ke Proyek">
          <span
            onClick={tambahButtonPress}
            className="text-lg text-default-400 cursor-pointer active:opacity-50"
          >
            <AddIcon />
          </span>
        </Tooltip>
      </>
    );
  return;
}

function KembaliButton({ id_proyek }) {
  if (id_proyek)
    return (
      <>
        <Link href={`/proyek/detail?id=${id_proyek}`}>
          <Button color="primary">Kembalik ke Proyek {"==>"}</Button>
        </Link>
      </>
    );
  return;
}
