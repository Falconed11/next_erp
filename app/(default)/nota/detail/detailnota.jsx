"use client";
import React, { useState, useRef } from "react";
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
import { useReactToPrint } from "react-to-print";
import { getApiPath, useClientFetch } from "../../../utils/apiconfig";
import myDate, { getDateFId } from "@/app/utils/date";
import { penawaran } from "@/app/utils/formatid";
import Harga from "../../../../components/harga";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Divider } from "@nextui-org/react";
import { Spacer } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../../public/logofinal.jpg";

const api_path = getApiPath();

export default function App({ id }) {
  const componentRef = {
    nota: useRef(),
  };
  const handlePrintNota = useReactToPrint({
    content: () => componentRef.nota.current,
    pageStyle: "p-10",
  });
  const nota = useClientFetch(`nota?id=${id}`);
  const keranjangNota = useClientFetch(`keranjangnota?id_nota=${id}`);
  const kategori = useClientFetch(`kategoriproduk`);
  const [selectKategori, setSelectKategori] = useState(new Set([]));
  const produk = useClientFetch(
    `produk?kategori=${selectKategori.values().next().value}`
  );
  const [selectProduk, setSelectProduk] = useState(new Set([]));
  const [form, setForm] = useState({});

  const editButtonPress = (data) => {
    setForm({
      ...data,
      harga: data.hargakustom,
    });
    modal.produk.onOpen();
    return;
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus produk?")) {
      const res = await fetch(`${api_path}keranjangnota`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      return;
      // return alert(json.message);
    }
  };
  const tambahButtonPress = async ({ select, form }) => {
    if (select.size == 0) return alert("Produk belum dipilih.");
    const res = await fetch(`${api_path}keranjangnota`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id_nota: id,
        id_produk: select.values().next().value,
        jumlah: form.jumlah,
        harga: form.harga,
      }),
    });
    const json = await res.json();
    // return alert(json.message);
  };
  const simpanButtonPress = async (data, onClose) => {
    const res = await fetch(`${api_path}keranjangnota`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id: data.id_keranjangnota,
        jumlah: data.jumlah,
        harga: data.harga,
        // harga: data.hargajual,
      }),
    });
    const json = await res.json();
    onClose();
    console.log(json.message);
    //return alert(json.message);
  };
  const renderCell = {
    keranjangnota: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "hargamodal":
          return <Harga harga={data.hargamodal} />;
        case "hargajual":
          return <Harga harga={data.hargajual} />;
        case "hargakustom":
          return <Harga harga={data.hargakustom} />;
        case "totalharga-modal":
          return <Harga harga={data.jumlah * data.hargamodal} />;
        case "totalharga-jual":
          return <Harga harga={data.jumlah * data.hargajual} />;
        case "profit":
          return <Harga harga={data.hargajual - data.hargamodal} />;
        case "totalprofit":
          return (
            <Harga
              harga={
                data.jumlah * data.hargajual - data.jumlah * data.hargamodal
              }
            />
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
                  onClick={() => deleteButtonPress(data.id_keranjangnota)}
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
    keranjangnotaprint: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      const harga = data.hargakustom > 0 ? data.hargakustom : data.hargajual;
      const subTotal = harga * data.jumlah;
      switch (columnKey) {
        case "jumlah":
          return (
            <div className="w-24 px-0 leading-65 text-sm">
              {data.jumlah} {data.satuan}
            </div>
          );
        case "nama":
          return <div className="pl-0 w-60">{data.nama}</div>;
        case "harga":
          return (
            <div className="w-17 text-xs px-0 leading-65 text-right">
              <Harga harga={harga} />
            </div>
          );
        case "total":
          return (
            <div className="w-24 px-0 text-right">
              <Harga harga={subTotal} />
            </div>
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
                  onClick={() => deleteButtonPress(data.id_keranjangnota)}
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
    nota: useDisclosure(),
  };
  const col = {
    keranjangnota: [
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
        key: "stok",
        label: "Stok",
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
        key: "hargajual",
        label: "Harga Jual",
      },
      {
        key: "hargakustom",
        label: "Harga Kustom",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
    keranjangnotaprint: [
      {
        key: "jumlah",
        label: "Banyaknya",
      },
      {
        key: "nama",
        label: "Nama",
      },
      {
        key: "harga",
        label: "Harga",
      },
      {
        key: "total",
        label: "Total",
      },
    ],
  };

  if (nota.error) return <div>failed to load</div>;
  if (nota.isLoading) return <div>loading...</div>;
  if (keranjangNota.error) return <div>failed to load</div>;
  if (keranjangNota.isLoading) return <div>loading...</div>;
  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  if (produk.error) return <div>failed to load</div>;
  if (produk.isLoading) return <div>loading...</div>;

  const dataKeranjangNota = keranjangNota.data.map((produk, i) => {
    return { ...produk, no: i + 1 };
  });
  const selectedNota = nota.data[0];
  const subTotalHargaJual = keranjangNota.data.reduce((total, currentValue) => {
    return total + currentValue.jumlah * currentValue.hargajual;
  }, 0);
  const subTotalKustomJual = keranjangNota.data.reduce(
    (total, currentValue) => {
      return (
        total +
        currentValue.jumlah *
          (currentValue.hargakustom
            ? currentValue.hargakustom
            : currentValue.hargajual)
      );
    },
    0
  );
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row gap-2">
        {/*Detail  */}
        <div className="bg-white rounded-lg p-3">
          <div>Detail</div>
          <div className="flex">
            <div>
              <div>No.</div>
              <div>Tanggal</div>
              <div>User</div>
              <div>Instansi</div>
              <div>Karyawan</div>
            </div>
            <div>
              <div>: {selectedNota.id_kustom}</div>
              <div>: {getDateFId(new Date(selectedNota.tanggal))} </div>
              <div>: {selectedNota.user} </div>
              <div>: {selectedNota.instansi} </div>
              <div>: {selectedNota.namakaryawan} </div>
            </div>
          </div>
        </div>
      </div>
      {/* tombol print */}
      <div className="flex flex-row gap-2">
        <div>
          <Button onClick={modal.nota.onOpen} color="primary" className="mt-3">
            Nota
          </Button>
        </div>
      </div>
      {/* tabel produk */}
      <Table
        classNames=""
        topContent={
          <>
            <div>Produk</div>
            <div className="flex flex-row">
              <Select
                label="Kategori"
                placeholder="Pilih kategori!"
                className="w-2/12"
                selectedKeys={selectKategori}
                onSelectionChange={setSelectKategori}
              >
                {kategori.data.map((item) => (
                  <SelectItem key={item.kategori} value={item.kategori}>
                    {item.kategori}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Produk"
                placeholder="Pilih produk!"
                className="w-5/12 pl-2"
                selectedKeys={selectProduk}
                onSelectionChange={setSelectProduk}
              >
                {produk.data.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={item.id}
                    textValue={`${item.nama}`}
                  >
                    {item.nama} | {item.merek} | {item.tipe} | {item.jumlah} |{" "}
                    {item.satuan} | {item.hargamodal} | {item.hargajual}
                  </SelectItem>
                ))}
              </Select>
              <Input
                type="number"
                value={form.jumlah}
                label="Jumlah"
                placeholder="Masukkan jumlah!"
                className="w-2/12 pl-2"
                endContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small"></span>
                  </div>
                }
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    jumlah: v,
                  })
                }
              />
              <Input
                type="number"
                value={form.harga}
                label="Harga Kustom"
                placeholder="Masukkan harga!"
                className="w-2/12 pl-2"
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    harga: v,
                  })
                }
              />
              <Button
                onClick={() => {
                  tambahButtonPress({ select: selectProduk, form });
                }}
                color="primary"
                className="ml-2"
              >
                Tambah
              </Button>
              {/* <div>
                <Link href={`/stok?id_proyek=${proyek.id}`}>
                  <Button color="primary">Tambah</Button>
                </Link>
              </div> */}
            </div>
          </>
        }
        bottomContent={
          <>
            <div className="text-right">
              <div>
                <Harga
                  label="Sub Total Harga Jual :"
                  harga={subTotalHargaJual}
                />
              </div>
            </div>
          </>
        }
        className="pt-3"
        aria-label="Example table with custom cells"
      >
        <TableHeader columns={col.keranjangnota}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={keranjangNota.data}>
          {(item) => (
            <TableRow key={item.id_keranjangnota}>
              {(columnKey) => (
                <TableCell>
                  {renderCell.keranjangnota(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* edit produk */}
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
                <div>Kategori : {form.kategori}</div>
                <div>Nama : {form.nama}</div>
                <div>Merek : {form.merek}</div>
                <div>Tipe : {form.tipe}</div>
                <div>Satuan : {form.satuan}</div>
                <div>Stok : {form.stok}</div>
                <Input
                  type="number"
                  label="Jumlah"
                  placeholder="Masukkan jumlah!"
                  value={form.jumlah}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      jumlah: v,
                    })
                  }
                />
                <Input
                  type="number"
                  value={form.harga}
                  label="Harga Kustom"
                  placeholder="Masukkan harga!"
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      harga: v,
                    })
                  }
                />
                <div>Harga Jual : {<Harga harga={form.hargajual} />}</div>
                <div>
                  Total Harga Jual :{" "}
                  {<Harga harga={form.hargajual * form.jumlah} />}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => simpanButtonPress(form, onClose)}
                >
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* nota */}
      <Modal
        scrollBehavior="inside"
        size="4xl"
        isOpen={modal.nota.isOpen}
        onOpenChange={modal.nota.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Nota</ModalHeader>
              <ModalBody>
                <div ref={componentRef.nota} className="bg-white text-black">
                  <div className="flex flex-row mt-0 pt-0 top-0">
                    <div className="basis-1/4"></div>
                    <div className="w-44"></div>
                    <div className="basis-1/4 text-right text-sm">
                      <div className="">
                        <div className="flex flex-row">
                          <div className="basis-3/4 top-neg-1">
                            {`${myDate.getDateFId(
                              new Date(selectedNota.tanggal),
                              "dd-month"
                            )} `}
                          </div>
                          <div className="basis-1/4">
                            {`${myDate.getDateFId(
                              new Date(selectedNota.tanggal),
                              "yy"
                            )}`}
                          </div>
                        </div>
                      </div>
                      <div>{selectedNota.user}</div>
                      <div>{selectedNota.instansi}</div>
                      <div>{selectedNota.id_kustom}</div>
                    </div>
                  </div>
                  <div className="h-15-5"></div>
                  <div className="flex flex-row">
                    <div className="">
                      <Table
                        hideHeader
                        removeWrapper
                        className="pt-3 h-keranjangnotaprint"
                        aria-label="Example table with custom cells"
                      >
                        <TableHeader columns={col.keranjangnotaprint}>
                          {(column) => (
                            <TableColumn
                              key={column.key}
                              align={"end"}
                              width={"0px"}
                            >
                              {column.label}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody items={keranjangNota.data}>
                          {(item) => (
                            <TableRow
                              className="flex"
                              key={item.id_keranjangnota}
                            >
                              {(columnKey) => (
                                <TableCell className="px-1 py-0 leading-65">
                                  {renderCell.keranjangnotaprint(
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="flex flex-row">
                    <div className="w-100"></div>
                    <div className="text-xs text-right w-18">
                      <Harga harga={subTotalKustomJual} />
                    </div>
                  </div>
                  <div className="h-8"></div>
                  <div className="flex flex-row">
                    <div className="basis-1/4"></div>
                    <div className="w-44"></div>
                    <div className="basis-1/4">{selectedNota.namakaryawan}</div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Tutup
                </Button>
                <Button color="primary">Cetak</Button>
                <Button onClick={handlePrintNota} color="primary">
                  React to Print
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
