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
} from "../../../components/icon";
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
import { getDateFId } from "@/app/utils/date";
import { penawaran } from "@/app/utils/formatid";
import Harga from "../../../components/harga";
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
    penawaran: useRef(),
    invoice: useRef(),
  };
  const handlePrintInvoice = useReactToPrint({
    content: () => componentRef.invoice.current,
    bodyClass: "m-10",
  });
  const handlePrintPenawaran = useReactToPrint({
    content: () => componentRef.penawaran.current,
    bodyClass: "m-10",
  });

  // const handlePrintInvoice = (src) => {
  //   useReactToPrint({
  //     content: () => src.current,
  //     bodyClass: "m-10",
  //   });
  // };

  const proyek = useClientFetch(`proyek?id=${id}`);
  const keranjangProyek = useClientFetch(
    `keranjangproyek?id_proyek=${id}&instalasi=0`
  );
  const keranjangProyekInstalasi = useClientFetch(
    `keranjangproyek?id_proyek=${id}&instalasi=1`
  );
  const kategori = useClientFetch(`kategoriproduk`);
  const [selectKategori, setSelectKategori] = useState(new Set([]));
  const [selectKategoriInstalasi, setSelectKategoriInstalasi] = useState(
    new Set([])
  );
  const produk = useClientFetch(
    `produk?kategori=${selectKategori.values().next().value}`
  );
  const instalasi = useClientFetch(
    `produk?kategori=${selectKategoriInstalasi.values().next().value}`
  );
  const [selectProduk, setSelectProduk] = useState(new Set([]));
  const [selectInstalasi, setSelectInstalasi] = useState(new Set([]));
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
  const tambahButtonPress = async ({ instalasi, select }) => {
    if (select.size == 0) return alert("Produk belum dipilih.");
    const res = await fetch(`${api_path}keranjangproyek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id_proyek: id,
        id_produk: select.values().next().value,
        jumlah: 0,
        instalasi,
      }),
    });
    const json = await res.json();
    return alert(json.message);
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
        // harga: data.hargajual,
      }),
    });
    const json = await res.json();
    return alert(json.message);
  };
  const renderCell = {
    keranjangproyek: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "hargamodal":
          return <Harga harga={data.hargamodal} />;
        case "hargajual":
          return <Harga harga={data.hargajual} />;
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
    penawaran: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "jumlah":
          return `${data.jumlah} ${data.satuan}`;
        case "hargajual":
          return (
            <div className="text-right">
              {data.hargajual.toLocaleString("id-ID")}
            </div>
          );
        case "total":
          return (
            <div className="text-right">
              {(data.jumlah * data.hargajual).toLocaleString("id-ID")}
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
  const modal = {
    produk: useDisclosure(),
    penawaran: useDisclosure(),
    invoice: useDisclosure(),
  };
  const col = {
    keranjangproyek: [
      {
        key: "kategori",
        label: "Kategori",
      },
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
        key: "hargamodal",
        label: "Harga Modal",
      },
      {
        key: "hargajual",
        label: "Harga Jual",
      },
      {
        key: "profit",
        label: "Profit",
      },
      {
        key: "totalharga-modal",
        label: "Total Harga Modal",
      },
      {
        key: "totalharga-jual",
        label: "Total Harga Jual",
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
    instalasi: [
      {
        key: "kategori",
        label: "Kategori",
      },
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
        key: "hargamodal",
        label: "Harga Modal",
      },
      {
        key: "hargajual",
        label: "Harga Instalasi",
      },
      {
        key: "profit",
        label: "Profit",
      },
      {
        key: "totalharga-modal",
        label: "Total Harga Modal",
      },
      {
        key: "totalharga-jual",
        label: "Total Harga Instalasi",
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
    penawaran: [
      {
        key: "no",
        label: "No.",
      },
      {
        key: "nama",
        label: "Nama Barang",
      },
      {
        key: "merek",
        label: "",
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
        key: "hargajual",
        label: "Harga Satuan (Rp)",
      },
      {
        key: "total",
        label: "Total Harga (Rp)",
      },
    ],
    invoice: [
      {
        key: "no",
        label: "#",
      },
      {
        key: "deskripsi",
        label: "Deskripsi Item",
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
        key: "total",
        label: "Total",
      },
    ],
  };
  const invoice = [
    {
      no: 1,
      deskripsi: "CCTV",
      jumlah: 2,
      harga: 300000,
    },
  ];

  if (proyek.error) return <div>failed to load</div>;
  if (proyek.isLoading) return <div>loading...</div>;
  if (keranjangProyek.error) return <div>failed to load</div>;
  if (keranjangProyek.isLoading) return <div>loading...</div>;
  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  if (produk.error) return <div>failed to load</div>;
  if (produk.isLoading) return <div>loading...</div>;
  if (instalasi.error) return <div>failed to load</div>;
  if (instalasi.isLoading) return <div>loading...</div>;

  const dataPenawaran = keranjangProyek.data.map((produk, i) => {
    return { ...produk, no: i + 1 };
  });
  const selectedProyek = proyek.data[0];
  const totalModalProduk = keranjangProyek.data.reduce((total, harga) => {
    return total + harga.jumlah * harga.hargamodal;
  }, 0);
  let totalModalInstalasi = 0;
  if (keranjangProyekInstalasi.data.size > 0) {
    totalModalInstalasi = keranjangProyekInstalasi.data.reduce(
      (total, harga) => {
        return total + harga.jumlah * harga.hargamodal;
      },
      0
    );
  }
  const totalModal = totalModalProduk + totalModalInstalasi;
  const subTotalHargaJual = keranjangProyek.data.reduce(
    (total, currentValue) => {
      return total + currentValue.jumlah * currentValue.hargajual;
    },
    0
  );
  const subTotalHargaInstalasi = keranjangProyekInstalasi.data.reduce(
    (total, currentValue) => {
      return total + currentValue.jumlah * currentValue.hargajual;
    },
    0
  );
  const totalHarga = subTotalHargaJual + subTotalHargaInstalasi;
  const maksDiskon = totalHarga - totalModal;
  const maksDiskonPersen = (maksDiskon / totalHarga) * 100;
  const maksDiskonInstalasi = keranjangProyekInstalasi.data.reduce(
    (total, currentValue) => {
      return (
        total +
        currentValue.jumlah * (currentValue.hargajual - currentValue.hargamodal)
      );
    },
    0
  );
  const maksDiskonPersenInstalasi =
    (maksDiskonInstalasi / subTotalHargaInstalasi) * 100;
  const diskonPersen = (selectedProyek.diskon / totalHarga) * 100;
  const hargaDiskon = totalHarga - selectedProyek.diskon;
  const pajak = (hargaDiskon * selectedProyek.pajak) / 100;
  const finalHarga = totalHarga + pajak;
  return (
    <div>
      <div className="flex flex-row gap-2">
        <div className="bg-white rounded-lg p-3">
          <div>Detail</div>
          <div className="flex">
            <div>
              <div>Perusahaan</div>
              <div>Nama Proyek{"  "}</div>
              <div>Tanggal</div>
              <div>Klien</div>
              <div>Sales</div>
              <div>Status</div>
            </div>
            <div>
              <div>: {selectedProyek.perusahaan} </div>
              <div>: {selectedProyek.nama} </div>
              <div>: {getDateFId(new Date(selectedProyek.tanggal))} </div>
              <div>: {selectedProyek.klien} </div>
              <div>: {selectedProyek.namakaryawan} </div>
              <div>: {selectedProyek.statusproyek} </div>
            </div>
          </div>
        </div>
        {/* rekapitulasi */}
        <div className="bg-white rounded-lg p-3 w-1/2">
          <div>Rekapitulasi</div>
          <div className="flex">
            <div className="basis-1/4">
              <div>Sub Total Harga</div>
              <div>Maks Diskon</div>
              <div>Diskon</div>
              <div>Harga Diskon</div>
              <div>Pajak</div>
              <div>Total Harga</div>
            </div>
            <div className="basis-3/4">
              <div>
                : <Harga harga={totalHarga} />
              </div>
              <div>
                :{" "}
                <Harga
                  label={``}
                  harga={maksDiskon}
                  endContent={`(${maksDiskonPersen.toFixed(2)}%)`}
                />
              </div>
              <div>
                :{" "}
                <Harga
                  harga={proyek.data[0].diskon}
                  endContent={`(${diskonPersen.toFixed(2)}%)`}
                />
              </div>
              <div>
                : <Harga harga={hargaDiskon} />
              </div>
              <div>
                :{" "}
                <Harga
                  harga={pajak}
                  endContent={`(${selectedProyek.pajak}%)`}
                />
              </div>
              <div>
                : <Harga harga={finalHarga} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <div>
          <Button
            onClick={modal.penawaran.onOpen}
            color="primary"
            className="mt-3"
          >
            Penawaran
          </Button>
        </div>
        <div>
          <Button
            onClick={modal.invoice.onOpen}
            color="primary"
            className="mt-3"
          >
            Invoice
          </Button>
        </div>
      </div>
      {/* tabel produk */}
      <Table
        topContent={
          <>
            <div>Produk</div>
            <div className="flex flex-row">
              <Select
                label="Kategori"
                placeholder="Pilih kategori!"
                className="w-3/12"
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
                className="w-6/12 pl-2"
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
              <Button
                onClick={() => {
                  tambahButtonPress({ select: selectProduk });
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
                  harga={keranjangProyek.data.reduce((total, currentValue) => {
                    return (
                      total + currentValue.jumlah * currentValue.hargamodal
                    );
                  }, 0)}
                  label="Sub Total Harga Modal :"
                />
              </div>
              <div>
                <Harga
                  label="Sub Total Harga Jual :"
                  harga={subTotalHargaJual}
                />
              </div>
              <div>
                <Harga
                  label={"Sub Total Provit :"}
                  harga={keranjangProyek.data.reduce((total, currentValue) => {
                    return (
                      total +
                      currentValue.jumlah *
                        (currentValue.hargajual - currentValue.hargamodal)
                    );
                  }, 0)}
                />
              </div>
              {/* <div>
                <Harga
                  label="Maks Diskon :"
                  harga={maksDiskon}
                  endContent={`(${maksDiskonPersen.toFixed(2)}%)`}
                />
              </div>
              <div>Diskon : {proyek.data[0].diskon}</div>
              <div>Pajak : {proyek.data[0].pajak}%</div> */}
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
            <TableRow key={item.no}>
              {(columnKey) => (
                <TableCell>
                  {renderCell.keranjangproyek(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* tabel instalasi */}
      <Table
        topContent={
          <>
            <div>Instalasi</div>
            <div className="flex flex-row">
              <Select
                label="Kategori"
                placeholder="Pilih kategori!"
                className="w-3/12"
                selectedKeys={selectKategoriInstalasi}
                onSelectionChange={setSelectKategoriInstalasi}
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
                className="w-6/12 pl-2"
                selectedKeys={selectInstalasi}
                onSelectionChange={setSelectInstalasi}
              >
                {instalasi.data.map((item) => (
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
              <Button
                onClick={() => {
                  tambahButtonPress({ instalasi: 1, select: selectInstalasi });
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
                  harga={keranjangProyekInstalasi.data.reduce(
                    (total, currentValue) => {
                      return (
                        total + currentValue.jumlah * currentValue.hargamodal
                      );
                    },
                    0
                  )}
                  label="Sub Total Harga Modal :"
                />
              </div>
              <div>
                <Harga
                  label="Sub Total Harga Instalasi :"
                  harga={subTotalHargaInstalasi}
                />
              </div>
              <div>
                <Harga
                  label={"Sub Total Provit :"}
                  harga={keranjangProyekInstalasi.data.reduce(
                    (total, currentValue) => {
                      return (
                        total +
                        currentValue.jumlah *
                          (currentValue.hargajual - currentValue.hargamodal)
                      );
                    },
                    0
                  )}
                />
              </div>
              {/* <div>
                <Harga
                  label="Maks Diskon :"
                  harga={maksDiskonInstalasi}
                  endContent={`(${maksDiskonPersenInstalasi.toFixed(2)}%)`}
                />
              </div>
              <div>Diskon : {proyek.data[0].diskon}</div>
              <div>Pajak : {proyek.data[0].pajak}%</div> */}
            </div>
          </>
        }
        className="pt-3"
        aria-label="Example table with custom cells"
      >
        <TableHeader columns={col.instalasi}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={keranjangProyekInstalasi.data}>
          {(item) => (
            <TableRow key={item.no}>
              {(columnKey) => (
                <TableCell>
                  {renderCell.keranjangproyek(item, columnKey)}
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
                <div>Harga Modal : {form.hargamodal}</div>
                <div>Harga Jual : {form.hargajual}</div>
                <div>Provit : {form.hargajual - form.hargamodal}</div>
                {/* <div>
                  <div>Harga Jual : </div>
                  <div>
                    <Input
                      type="number"
                      value={form.hargajual}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          hargajual: v,
                          profit: parseInt(v) - form.hargamodal,
                        })
                      }
                    />
                  </div>
                </div> */}
                <div>Total Harga Modal : {form.hargamodal * form.jumlah}</div>
                <div>Total Harga Jual : {form.hargajual * form.jumlah}</div>
                {/* <div>
                  <div>Profit : </div>
                  <div>
                    <Input
                      type="number"
                      value={form.profit}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          profit: v,
                          hargajual: form.hargamodal + parseInt(v),
                        })
                      }
                    />
                  </div>
                </div> */}
                <div>
                  Total Profit :{" "}
                  {(form.hargajual - form.hargamodal) * form.jumlah}
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
      {/* penawaran */}
      <Modal
        scrollBehavior="inside"
        size="4xl"
        isOpen={modal.penawaran.isOpen}
        onOpenChange={modal.penawaran.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Penawaran
              </ModalHeader>
              <ModalBody>
                <div
                  ref={componentRef.penawaran}
                  className="bg-white text-black"
                >
                  <div className="flex flex-row items-center">
                    <Image
                      src={logo}
                      alt="Company Logo"
                      width={70}
                      // height={500} automatically provided
                      // blurDataURL="data:..." automatically provided
                      // placeholder="blur" // Optional blur-up while loading
                    />
                    <div className="flex flex-col">
                      <div>Belga Karya Semesta</div>
                      <div>
                        General Trading - Mechanical Electrical - Supplies -
                        Consultant
                      </div>
                      <div>
                        Jogokaryan MJ 3/789, Mantrijeron - Yogyakarta Telp
                        08121553765 - 087839280341
                      </div>
                    </div>
                  </div>
                  <Divider className="bg-sky-500 my-3 py-2" />
                  <div className="pt-3 flex flex-row">
                    <div className="basis-1/2">
                      <div>
                        Yogyakarta,{" "}
                        {getDateFId(new Date(selectedProyek.tanggal))}
                      </div>
                      <div>
                        No :{" "}
                        {penawaran(
                          selectedProyek.id_kustom,
                          new Date(selectedProyek.tanggal)
                        )}
                      </div>
                      <br />
                      <div>Kepada Yth,</div>
                      <div>{selectedProyek.klien}</div>
                    </div>
                    <div className="basis-1/2 text-end">
                      {/* <div>Id : ASD21903SAD</div>
                      <div>Tanggal : 17 Oktober 2023</div> */}
                    </div>
                  </div>
                  <Table
                    className="mt-3 border"
                    aria-label="Example table with custom cells"
                    shadow="none"
                    topContent={<>Produk</>}
                    bottomContent={
                      <>
                        <div className="text-right">
                          Sub Total Harga :{" "}
                          {subTotalHargaJual.toLocaleString("id-ID")}
                        </div>
                      </>
                    }
                  >
                    <TableHeader columns={col.penawaran}>
                      {(column) => (
                        <TableColumn key={column.key}>
                          {column.label}
                        </TableColumn>
                      )}
                    </TableHeader>
                    <TableBody items={dataPenawaran}>
                      {(item) => (
                        <TableRow key={item.no}>
                          {(columnKey) => (
                            <TableCell>
                              {renderCell.penawaran(item, columnKey)}
                            </TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="flex flex-row mt-3">
                    <div className="">
                      Keterangan <br />
                      - Harga belum termasuk instalasi pemasangan. <br />
                      - Harga tidak termasuk pajak-pajak. <br />
                      - Syarat pembayaran sesuai dengan kesepakatan kedua belah
                      pihak. <br />
                      - Waktu penyerahan barang sesuai jadwal yang disepakati
                      bersama. <br />- Harga tidak terikat dan dapat berubah
                      sewaktu-waktu. <br /> <br />
                      Demikian penawaran ini kami ajukan, sambil menantikan
                      pesanan Bapak/Ibu, kami ucapkan terima kasih. <br />{" "}
                      <br />
                      Hormat kami, <br /> <br />
                      {proyek.data[0].namakaryawan}
                    </div>
                  </div>
                  {/* <div className="mt-3 bg-sky-500 h-px"></div>
                  <div className="flex items-center space-x-4">
                    <div># Telepon</div>
                    <Divider orientation="vertical" />
                    <div>Alamat</div>
                    <Divider orientation="vertical" />
                    <div>Website</div>
                  </div> */}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary">Cetak</Button>
                <Button onClick={handlePrintPenawaran} color="primary">
                  React to Print
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* invoice */}
      <Modal
        scrollBehavior="inside"
        size="4xl"
        isOpen={modal.invoice.isOpen}
        onOpenChange={modal.invoice.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Invoice</ModalHeader>
              <ModalBody>
                <div ref={componentRef.invoice} className="bg-white text-black">
                  <div className="flex flex-row items-center">
                    <Image
                      src={logo}
                      alt="Company Logo"
                      width={70}
                      // height={500} automatically provided
                      // blurDataURL="data:..." automatically provided
                      // placeholder="blur" // Optional blur-up while loading
                    />
                    <div className="flex flex-col">
                      <div>Nama Perusahaan</div>
                      <div>Deskripsi</div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center">
                    <div className="basis-1/2 bg-sky-500 h-4"></div>
                    <div className="basis-1/4 text-4xl font-bold text-center inline-block align-middle items-center">
                      Invoice
                    </div>
                    <div className="basis-1/4 bg-sky-500 h-4"></div>
                  </div>
                  <div className="pt-3 flex flex-row">
                    <div className="basis-1/2">
                      <div>Invoice kepada :</div>
                      <div>Nama client</div>
                      <div>Deskripsi</div>
                    </div>
                    <div className="basis-1/2 text-end">
                      <div>Id : ASD21903SAD</div>
                      <div>Tanggal : 17 Oktober 2023</div>
                    </div>
                  </div>
                  <Table
                    className="mt-3 border"
                    aria-label="Example table with custom cells"
                    shadow="none"
                  >
                    <TableHeader columns={col.invoice}>
                      {(column) => (
                        <TableColumn
                          key={column.key}
                          align={column.key === "aksi" ? "center" : "start"}
                        >
                          {column.label}
                        </TableColumn>
                      )}
                    </TableHeader>
                    <TableBody items={invoice}>
                      {(item) => (
                        <TableRow key={item.no}>
                          {(columnKey) => (
                            <TableCell>
                              {renderCell.invoice(item, columnKey)}
                            </TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="flex flex-row mt-3">
                    <div className="basis-2/4">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Natus accusamus cum, adipisci fugit excepturi doloremque
                      tenetur eligendi dolorum? Eaque veniam ea enim corrupti
                      sint modi officia fugiat totam in commodi.
                    </div>
                    <div className="basis-1/4"></div>
                    <div className="basis-1/4 pl-3">
                      <div className="pl-3">
                        <div>Sub Total : 600000</div>
                        <div>Pajak : 10%</div>
                      </div>
                      <div>
                        <div className="bg-sky-200 pl-3 font-semibold">
                          Total : {(600000 * 110) / 100}
                        </div>
                      </div>
                      <div className="py-3 text-center">TTD</div>
                      <div>Nama</div>
                    </div>
                  </div>
                  <div className="mt-3 bg-sky-500 h-px"></div>
                  <div className="flex items-center space-x-4">
                    <div># Telepon</div>
                    <Divider orientation="vertical" />
                    <div>Alamat</div>
                    <Divider orientation="vertical" />
                    <div>Website</div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary">Cetak</Button>
                <Button onClick={handlePrintInvoice} color="primary">
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
