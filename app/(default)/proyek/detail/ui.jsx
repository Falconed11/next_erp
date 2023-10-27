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
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Divider } from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../../public/logofinal.jpg";

const api_path = getApiPath();

export default function App({ proyek, id }) {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    bodyClass: "m-10",
  });

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
                <div ref={componentRef} className="bg-white text-black">
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
                <Button onClick={handlePrint} color="primary">
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
