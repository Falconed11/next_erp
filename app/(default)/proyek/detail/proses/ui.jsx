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
import { useReactToPrint } from "react-to-print";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import { getDateF, getDateFId, getDate } from "@/app/utils/date";
import { penawaran } from "@/app/utils/formatid";
import Harga from "@/components/harga";
import TambahProduk from "@/components/tambahproduk";
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import { Divider } from "@heroui/react";
import { Spacer } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logofinal.jpg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { NavLinkNewTab } from "@/components/mycomponent";
import PembayaranProyek from "./pembayaranproyek";
import { countPercentProvit, countRecapitulation } from "@/app/utils/formula";
import { highRoleCheck } from "@/app/utils/tools";
import { useSession } from "next-auth/react";

const api_path = getApiPath();

export default function App({ id }) {
  const session = useSession();
  const sessUser = session.data?.user;
  const componentRef = {
    nota: useRef(),
  };
  const handlePrintNota = useReactToPrint({
    content: () => componentRef.nota.current,
    pageStyle: "p-10",
  });
  const now = new Date();
  const [selectKategori, setSelectKategori] = useState(new Set([]));
  const [selectProduk, setSelectProduk] = useState(new Set([]));
  const karyawan = useClientFetch(`karyawan`);
  const [selectKaryawan, setSelectKaryawan] = useState("");
  const [form, setForm] = useState({
    startdate: now,
    selectKategori: new Set([]),
    selectProduk: new Set([]),
  });
  const [formPembayaran, setFormPembayaran] = useState({
    startdate: now,
    tanggal: getDate(now),
  });

  const proyek = useClientFetch(`proyek?id=${id}`);
  const pengeluaranproyek = useClientFetch(`pengeluaranproyek?id_proyek=${id}`);
  const pembayaranproyek = useClientFetch(`pembayaranproyek?id_proyek=${id}`);
  const kategori = useClientFetch(`kategoriproduk`);
  const metodepembayaran = useClientFetch(`metodepembayaran`);
  const produk = useClientFetch(
    `produk?kategori=${selectKategori.values().next().value}`
  );
  const selectedVersion = proyek.data?.[0]?.versi || 0;
  const sums = (pembayaranproyek?.data ?? []).reduce(
    (acc, v) => {
      if (v.status) acc.omset += v.nominal;
      acc.totalPenagihan += v.nominal;
      return acc;
    },
    { omset: 0, totalPenagihan: 0 }
  );
  const { omset, totalPenagihan } = sums;
  const keranjangPeralatan = useClientFetch(
    `keranjangproyek?id_proyek=${id}&instalasi=0&versi=${selectedVersion}`
  );
  const keranjangInstalasi = useClientFetch(
    `keranjangproyek?id_proyek=${id}&instalasi=1&versi=${selectedVersion}`
  );
  const rekapitulasiProyek = useClientFetch(
    `rekapitulasiproyek?id_proyek=${id}&versi=${selectedVersion}`
  );
  const queries = {
    proyek,
    pengeluaranproyek,
    pembayaranproyek,
    kategori,
    metodepembayaran,
    produk,
    keranjangPeralatan,
    keranjangInstalasi,
    rekapitulasiProyek,
  };

  const editButtonPress = (data) => {
    const startdate = new Date(data.tanggalpengeluaran);
    setForm({
      ...form,
      ...data,
      oldJumlah: data.jumlah,
      oldHarga: data.hargapengeluaran,
      harga: data.hargapengeluaran,
      modalmode: "Edit",
      tanggal: getDate(startdate),
      selectStatus: new Set([String(data.status)]),
      startdate,
      keterangan: data.keteranganpp,
    });
    setSelectKaryawan(new Set([String(data.id_karyawan)]));
    modal.pengeluaranproyek.onOpen();
  };
  const deleteButtonPress = async (data) => {
    if (confirm("Hapus produk?")) {
      if (data.id_produkkeluar == "") {
        const res = await fetch(`${api_path}pengeluaranproyek`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({ id: data.id_pengeluaranproyek }),
        });
        const json = await res.json();
        if (res.status == 400) return alert(json.message);
      } else {
        const res = await fetch(`${api_path}produkkeluar`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({
            ...data,
            id: data.id_produkkeluar,
            metodepengeluaran: "proyek",
            id_produk: data.id,
          }),
        });
        const json = await res.json();
        if (res.status == 400) return alert(json.message);
      }
      pengeluaranproyek.mutate();
    }
  };
  const tambahButtonPress = async ({ selectProduk, selectKaryawan, form }) => {
    // if (select.size == 0) return alert("Produk belum dipilih.");
    if (!selectKaryawan) return alert("Karyawan belum dipilih");
    if (form.isSelected && form.stok < form.jumlah)
      return alert("Jumlah melebihi stok.");
    let res;
    if (form.isSelected) {
      res = await fetch(`${api_path}produkkeluar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          ...form,
          id_proyek: id,
          id_produk: form.selectProduk,
          id_karyawan: selectKaryawan ?? 0,
          tanggal: form.startdate ? getDate(form.startdate) : "",
          jumlah: form.jumlah,
          harga: form.harga,
          keterangan: form.keterangan ? form.keterangan : "",
          status: form.status ? form.status : "",
        }),
      });
    } else {
      res = await fetch(`${api_path}pengeluaranproyek`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          ...form,
          id_proyek: id,
          id_produk: form.selectProduk,
          id_karyawan: selectKaryawan ?? 0,
          id_vendor: form.selectVendor,
          tanggal: form.startdate ? getDate(form.startdate) : "",
          jumlah: form.jumlah,
          harga: form.harga,
          keterangan: form.keterangan ? form.keterangan : "",
          status: form.status ? form.status : "",
        }),
      });
    }
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    setForm({
      ...form,
      stok: 0,
      satuan: "",
      jumlah: 0,
      selectKategori: new Set([]),
      selectProduk: new Set([]),
    });
    pengeluaranproyek.mutate();
    // return alert(json.message);
  };
  const simpanButtonPress = async (data, onClose) => {
    // return console.log({ form, id });
    let res;
    if (data.id_produkkeluar) {
      if (data.stok + data.oldJumlah < data.jumlah)
        return alert("Jumlah melebihi batas maksimal.");
      res = await fetch(`${api_path}produkkeluar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          ...data,
          id: data.id_produkkeluar,
          metodepengeluaran: "proyek",
          id_produk: data.id,

          id_proyek: id,
          // id_produk: form.selectProduk,
          // id_karyawan: selectKaryawan ?? 0,
          tanggal: data.startdate ? getDate(data.startdate) : "",
          jumlah: data.jumlah,
          harga: data.harga,
          keterangan: data.keterangan ? data.keterangan : "",
          status: data.status ? data.status : "",
        }),
      });
    } else
      res = await fetch(`${api_path}pengeluaranproyek`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          ...data,
          id: data.id_pengeluaranproyek,
          keterangan: data.keterangan ? data.keterangan : "",
          tanggal: getDate(new Date(data.startdate)),
          // harga: data.hargajual,
        }),
      });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    pengeluaranproyek.mutate();
    onClose();
    // console.log(json.message);
  };

  const editButtonPressPembayaran = (data) => {
    const startdate = new Date(data.tanggal);
    setFormPembayaran({
      ...data,
      tempNominal: data.nominal,
      modalmode: "Edit",
      selectMetodePembayaran: new Set([String(data.id_metodepembayaran)]),
      tanggal: getDate(startdate),
      startdate,
    });
    modal.pembayaranproyek.onOpen();
  };
  const deleteButtonPressPembayaran = async (id) => {
    if (confirm("Hapus pembayaran?")) {
      const res = await fetch(`${api_path}pembayaranproyek`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      // return alert(json.message);
      pembayaranproyek.mutate();
    }
  };
  const tambahButtonPressPembayaran = async (form) => {
    // if (select.size == 0) return alert("Produk belum dipilih.");
    const res = await fetch(`${api_path}pembayaranproyek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...form,
        id_proyek: id,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    setFormPembayaran({
      ...formPembayaran,
      nominal: 0,
    });
    pembayaranproyek.mutate();
  };
  const simpanButtonPressPembayaran = async (data, onClose) => {
    const res = await fetch(`${api_path}pembayaranproyek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    const startdate = new Date();
    setFormPembayaran({
      selectMetodePembayaran: new Set([String(data.id_metodepembayaran)]),
      tanggal: getDate(startdate),
      startdate,
    });
    pembayaranproyek.mutate();
    onClose();
    // return alert(json.message);
  };

  const isHighRole = highRoleCheck(sessUser?.rank);
  const renderCell = {
    pengeluaranproyek: React.useCallback(
      (data, columnKey) => {
        if (session.status === "loading") return;
        if (session.status === "unauthenticated") return;
        const cellValue = data[columnKey];
        const harga = data.hargaprodukmasuk || data.hargapengeluaran;
        switch (columnKey) {
          case "status":
            return data.status == 1 ? "Lunas" : "Belum Lunas";
          case "tanggal":
            return getDateF(new Date(data.tanggalpengeluaran));
          case "harga":
            return (
              <div className="text-right">
                {isHighRole || !data.id_produkkeluar ? (
                  <Harga harga={harga} />
                ) : (
                  "Sistem"
                )}
              </div>
            );
          case "totalharga":
            return (
              <div className="text-right">
                {isHighRole || !data.id_produkkeluar ? (
                  <Harga harga={data.jumlah * harga} />
                ) : (
                  "Sistem"
                )}
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
                    onClick={() => deleteButtonPress(data)}
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
      },
      [sessUser?.rank]
    ),
    pembayaranproyek: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "tanggal":
          return getDateF(new Date(data.tanggal));
        case "status":
          return cellValue ? "Lunas" : "Menunggu";
        case "id_second":
          return data.status ? cellValue : "";
        case "nominal":
          return <Harga harga={data.nominal} />;
        case "aksi":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Edit">
                <span
                  onClick={() => editButtonPressPembayaran(data)}
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Delete">
                <span
                  onClick={() => deleteButtonPressPembayaran(data.id)}
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
    pengeluaranproyek: useDisclosure(),
    pembayaranproyek: useDisclosure(),
  };
  const col = {
    pengeluaranproyek: [
      {
        key: "tanggal",
        label: "tanggal",
      },
      {
        key: "namakaryawan",
        label: "Karyawan",
      },
      {
        key: "nama",
        label: "Produk",
      },
      {
        key: "keteranganpp",
        label: "Keterangan",
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
        key: "vendor",
        label: "Vendor",
      },
      {
        key: "jumlah",
        label: "Jumlah",
      },
      {
        key: "harga",
        label: "Harga Satuan",
      },
      {
        key: "totalharga",
        label: "Tota Harga",
      },
      {
        key: "status",
        label: "Status",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
    pembayaranproyek: [
      {
        key: "tanggal",
        label: "tanggal",
      },
      {
        key: "id_second",
        label: "ID",
      },
      {
        key: "status",
        label: "Status",
      },
      {
        key: "nominal",
        label: "Nominal",
      },
      {
        key: "metodepembayaran",
        label: "Metode Pembayaran",
      },
      {
        key: "nama_bank",
        label: "Bank",
      },
      {
        key: "norekening",
        label: "Nomor Rekening",
      },
      {
        key: "atasnama",
        label: "Atas Nama",
      },
      {
        key: "pembayar",
        label: "Telah Terima Dari",
      },
      {
        key: "untukpembayaran",
        label: "Untuk Pembayaran",
      },
      {
        key: "keterangan",
        label: "Keterangan",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
  };
  for (const [name, data] of Object.entries(queries)) {
    if (data.error) return <div>Failed to load {name}</div>;
    if (data.isLoading) return <div>Loading {name}...</div>;
  }
  if (session.status === "loading") return <>Session Loading ...</>;
  const selectedProyek = proyek.data[0];
  const { rekapitulasiPeralatan, rekapitulasiInstalasi, rekapitulasiTotal } =
    countRecapitulation(
      keranjangPeralatan.data,
      keranjangInstalasi.data,
      rekapitulasiProyek.data[0] ?? {}
    );
  const biayaProduksi = pengeluaranproyek.data.reduce((total, v) => {
    return (
      total +
      v.jumlah * (v.hargapengeluaran ? v.hargapengeluaran : v.hargamodal)
    );
  }, 0);
  const provit = omset - biayaProduksi;
  return (
    <div className="flex flex-col gap-2 w-full-">
      <div className="flex gap-2">
        {/*Detail  */}
        <div className="bg-white rounded-lg p-3 w-1/4">
          <div>Detail</div>
          {[
            {
              key: "Tanggal",
              comp: getDateFId(new Date(selectedProyek.tanggal)),
            },
            {
              key: "Klien",
              comp: selectedProyek.klien,
            },
            {
              key: "Instansi",
              comp: selectedProyek.instansi,
            },
            {
              key: "Nama Proyek",
              comp: selectedProyek.nama,
            },
            {
              key: "Biaya Produksi",
              comp: <Harga harga={biayaProduksi} />,
            },
            {
              key: "Omset",
              comp: <Harga harga={omset} />,
            },
            {
              key: "Nilai Proyek",
              comp: <Harga harga={rekapitulasiTotal.hargaPajak} />,
            },
            ...(isHighRole
              ? [
                  {
                    key: "Provit",
                    comp: <Harga harga={provit} />,
                  },
                  {
                    key: "Provit Persen",
                    comp: `${countPercentProvit(biayaProduksi, omset).toFixed(
                      2
                    )}%`,
                  },
                ]
              : []),
          ].map((o, i) => (
            <div key={i} className="grid grid-cols-2">
              <div className="">{o.key}</div>
              <div className="text-right">{o.comp}</div>
            </div>
          ))}
        </div>
        {/* tabel pembayaranproyek */}
        <Table
          className="z-10"
          aria-label="Example table with custom cells"
          topContent={
            <>
              <div>Pembayaran Proyek</div>
              <div className="flex-col gap-2">
                <div className="flex flex-row gap-2 mt-3">
                  {
                    <PembayaranProyek
                      isCreate
                      form={formPembayaran}
                      setForm={setFormPembayaran}
                      metodepembayaran={metodepembayaran}
                      rekap={rekapitulasiTotal}
                      totalPenagihan={totalPenagihan}
                    />
                  }
                  <Button
                    onPress={() => {
                      tambahButtonPressPembayaran(formPembayaran);
                    }}
                    color="primary"
                    className="ml-2"
                  >
                    Tambah
                  </Button>
                </div>
              </div>
            </>
          }
        >
          <TableHeader columns={col.pembayaranproyek}>
            {(column) => (
              <TableColumn
                key={column.key}
                align={column.key === "aksi" ? "center" : "start"}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={"Kosong"} items={pembayaranproyek.data}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>
                    {renderCell.pembayaranproyek(item, columnKey)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex gap-2">
        <NavLinkNewTab
          href={`/proyek/detail?id=${selectedProyek.id}&versi=${
            selectedProyek.versi <= 0 ? "1" : selectedProyek.versi
          }`}
        >
          {"Penawaran ==>>"}
        </NavLinkNewTab>
      </div>
      {/* tombol print */}
      {/* <div className="flex flex-row gap-2">
        <div>
          <Button onClick={modal.nota.onOpen} color="primary" className="mt-3">
            Nota
          </Button>
        </div>
      </div> */}
      {/* tabel pengeluaran proyek */}
      <Table
        className="z-10"
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div>Pengeluaran Proyek</div>
            <div className="flex-col gap-2">
              <div className="flex flex-row gap-2">
                <TambahProduk
                  form={form}
                  setForm={setForm}
                  disableHargaKustom
                  refHargaModal
                />
              </div>
              <div className="flex flex-row gap-2 mt-3">
                <div className="bg-gray-100 p-3 rounded-lg z-50">
                  <div>Tanggal</div>
                  <DatePicker
                    placeholderText="Pilih tanggal"
                    dateFormat="dd/MM/yyyy"
                    selected={form.startdate}
                    onChange={(v) => setForm({ ...form, startdate: v })}
                  />
                </div>
                <Select
                  label="Karyawan"
                  placeholder="Pilih karyawan!"
                  className="w-2/12"
                  selectedKeys={[selectKaryawan]}
                  onChange={(e) => setSelectKaryawan(e.target.value)}
                >
                  {karyawan.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  type="text"
                  value={form.keterangan}
                  label="Keterangan"
                  placeholder="Masukkan keterangan!"
                  className="w-2/12 pl-2"
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      keterangan: v,
                    })
                  }
                />
                {/* <Input
                  type="text"
                  value={form.status}
                  label="Status"
                  placeholder="Masukkan status!"
                  className="w-2/12 pl-2"
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      status: v,
                    })
                  }
                /> */}
                {!form.isSelected ? (
                  <Select
                    label="Status"
                    placeholder="Pilih status!"
                    className="w-2/12"
                    selectedKeys={form.selectStatus}
                    onSelectionChange={(v) =>
                      setForm({
                        ...form,
                        selectStatus: v,
                        status: v.values().next().value,
                      })
                    }
                  >
                    {[
                      { id: 0, nama: "Belum Lunas" },
                      { id: 1, nama: "Lunas" },
                    ].map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nama}
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <></>
                )}

                <Button
                  onPress={() => {
                    tambahButtonPress({ selectProduk, selectKaryawan, form });
                  }}
                  color="primary"
                  className="ml-2"
                >
                  Tambah
                </Button>
              </div>
            </div>
          </>
        }
      >
        <TableHeader columns={col.pengeluaranproyek}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={pengeluaranproyek.data}>
          {(item) => (
            <TableRow key={item.id_pengeluaranproyek}>
              {(columnKey) => (
                <TableCell>
                  {renderCell.pengeluaranproyek(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* edit pengeluaranproyek */}
      <Modal
        scrollBehavior="inside"
        isOpen={modal.pengeluaranproyek.isOpen}
        onOpenChange={modal.pengeluaranproyek.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Pengeluaran Proyek
              </ModalHeader>
              <ModalBody>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div>Tanggal</div>
                  <DatePicker
                    placeholderText="Pilih tanggal"
                    dateFormat="dd/MM/yyyy"
                    selected={form.startdate}
                    onChange={(v) => setForm({ ...form, startdate: v })}
                  />
                </div>
                <div>Karyawan : {form.namakaryawan}</div>
                <div>Produk : {form.nama}</div>
                <Input
                  type="text"
                  value={form.keterangan}
                  label="Keterangan"
                  placeholder="Masukkan keterangan!"
                  className=""
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      keterangan: v,
                    })
                  }
                />
                <div>Merek : {form.merek}</div>
                <div>Tipe : {form.tipe}</div>
                <Input
                  type="number"
                  label={`Jumlah ${
                    form.id_produkkeluar &&
                    `(Maks : ${form.stok + form.oldJumlah})`
                  }`}
                  placeholder="Masukkan jumlah!"
                  value={form.jumlah}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      jumlah: v,
                    })
                  }
                />
                {/* <div>Harga Modal : {form.hargamodal}</div> */}
                <Input
                  type="number"
                  disabled={form.id_produkkeluar ? true : undefined}
                  value={form.harga}
                  label={`Harga Satuan (${form.oldHarga})`}
                  placeholder="Masukkan harga!"
                  className=""
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      harga: v,
                    })
                  }
                />
                {/* <div>
                  Total Harga :{" "}
                  {form.jumlah *
                    (form.hargakustom ? form.hargakustom : form.hargamodal)}
                </div> */}
                {/* <Input
                  type="text"
                  value={form.status}
                  label="Status"
                  placeholder="Masukkan status!"
                  className=""
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      status: v,
                    })
                  }
                /> */}
                {!form.id_produkkeluar ? (
                  <Select
                    label="Status"
                    placeholder="Pilih status!"
                    className=""
                    selectedKeys={form.selectStatus}
                    onSelectionChange={(v) =>
                      setForm({
                        ...form,
                        selectStatus: v,
                        status: v.values().next().value,
                      })
                    }
                  >
                    {[
                      { id: 0, nama: "Belum Lunas" },
                      { id: 1, nama: "Lunas" },
                    ].map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nama}
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <></>
                )}
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
      {/* edit pembayaranproyek */}
      <Modal
        scrollBehavior="inside"
        isOpen={modal.pembayaranproyek.isOpen}
        onOpenChange={modal.pembayaranproyek.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Pembayaran Proyek
              </ModalHeader>
              <ModalBody>
                <PembayaranProyek
                  form={formPembayaran}
                  setForm={setFormPembayaran}
                  metodepembayaran={metodepembayaran}
                  rekap={rekapitulasiTotal}
                  totalPenagihan={totalPenagihan}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    const startdate = new Date();
                    setFormPembayaran({
                      selectMetodePembayaran: new Set([
                        String(form.id_metodepembayaran),
                      ]),
                      tanggal: getDate(startdate),
                      startdate,
                    });
                    onClose();
                  }}
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() =>
                    simpanButtonPressPembayaran(formPembayaran, onClose)
                  }
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
                  <div className="flex flex-row">
                    <div className="basis-3/4"></div>
                    <div className="basis-1/4">
                      <div>{selectedNota.tanggal}</div>
                      <div>{selectedNota.user}</div>
                      <div>{selectedNota.instansi}</div>
                      <div>{selectedNota.id_kustom}</div>
                    </div>
                  </div>
                  <div className="h-96"></div>
                  <div>{selectedNota.namakaryawan}</div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Tutup
                </Button>
                <Button color="primary">Cetak</Button>
                <Button onPress={handlePrintNota} color="primary">
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
