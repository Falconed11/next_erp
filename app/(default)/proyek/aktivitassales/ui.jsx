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
  Textarea,
} from "@heroui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
  NoteIcon,
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
import Harga from "@/components/harga";
import DetailProyek from "@/components/detailproyek";
import TambahProduk from "@/components/tambahproduk";
import SelectStatusProyek from "@/components/selectstatusproyek";
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
import { NavLinkNewTab, LinkOpenNewTab } from "@/components/mycomponent";
import { highRoleCheck } from "@/app/utils/tools";
import { useSession } from "next-auth/react";

const api_path = getApiPath();

export default function App({ id }) {
  const session = useSession();
  const sessUser = session.data?.user;
  const [form, setForm] = useState({});
  const [selectStatusProyek, setSelectStatusProyek] = useState(id ? null : 3);

  const aktivitassales = useClientFetch(
    `aktivitassales?${id ? `id_proyek=${id}` : "groupbyproyek=true"}${
      selectStatusProyek ? `&id_statusproyek=${selectStatusProyek}` : ""
    }`
  );
  const karyawan = useClientFetch(`karyawan`);
  const proyek = useClientFetch(id ? `proyek?id=${id}` : "");
  const selectedVersion = proyek.data?.[0]?.versi || 0;
  const queries = {
    aktivitassales,
    karyawan,
    proyek,
  };

  const editButtonPress = (data) => {
    setForm({ ...data, method: "PUT" });
    modal.aktivitassales.onOpen();
  };
  const deleteButtonPress = async (data) => {
    if (confirm("Hapus data?")) {
      const res = await fetch(`${api_path}aktivitassales`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          id: data.id,
        }),
      });
      const json = await res.json();
      if (res.status == 400) return alert(json.message);
      aktivitassales.mutate();
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
      res = await fetch(`${api_path}aktivitassales`, {
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
    aktivitassales.mutate();
    // return alert(json.message);
  };
  const simpanButtonPress = async (data, onClose) => {
    // return console.log({ form, id });
    const res = await fetch(`${api_path}aktivitassales`, {
      method: form.method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({ ...data, id_proyek: id }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    aktivitassales.mutate();
    onClose();
    // console.log(json.message);
  };

  const renderCell = {
    aktivitassales: React.useCallback(
      (data, columnKey) => {
        if (session.status === "loading") return;
        if (session.status === "unauthenticated") return;
        const cellValue = data[columnKey];
        const harga = data.hargaprodukmasuk || data.hargapengeluaran;
        switch (columnKey) {
          case "status":
            return data.status == 1 ? "Lunas" : "Belum Lunas";
          case "tanggal":
            return getDateF(new Date(data.tanggal));
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
                <LinkOpenNewTab
                  content="Riwayat"
                  link={`/proyek/aktivitassales?id=${data.id_proyek}&versi=${
                    data.versi <= 0 ? "1" : data.versi
                  }`}
                  icon={<NoteIcon />}
                />
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
  };
  const modal = {
    produk: useDisclosure(),
    nota: useDisclosure(),
    aktivitassales: useDisclosure(),
    pembayaranproyek: useDisclosure(),
  };
  const col = {
    aktivitassales: [
      {
        key: "tanggal",
        label: "tanggal",
      },
      {
        key: "karyawan",
        label: "Karyawan",
      },
      ...(id
        ? []
        : [
            {
              key: "statusproyek",
              label: "Status",
            },
            {
              key: "instansi",
              label: "Instansi",
            },
            {
              key: "kota",
              label: "Kota",
            },
            {
              key: "jumlahaktivitas",
              label: "Jumlah Aktivitas",
            },
          ]),
      {
        key: "aktivitas",
        label: "Aktivitas",
      },
      {
        key: "catatan",
        label: "Catatan",
      },
      {
        key: "output",
        label: "Output",
      },
      {
        key: "tindakanselanjutnya",
        label: "Tindakan Selanjutnya",
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
  const isHighRole = highRoleCheck(sessUser.rank);
  const selectedProyek = proyek.data?.[0];
  return (
    <div className="flex flex-col gap-2 w-full-">
      <div className="flex gap-2">{id && <DetailProyek id_proyek={id} />}</div>
      <div className="flex gap-2">
        {id && (
          <>
            <div>
              <Button
                color="primary"
                onPress={() => {
                  setForm({ tanggal: new Date(), method: "POST" });
                  modal.aktivitassales.onOpen();
                }}
              >
                Tambah
              </Button>
            </div>
            {/* <div className="flex gap-2">
              <NavLinkNewTab
                href={`/proyek/detail?id=${selectedProyek.id}&versi=${
                  selectedProyek.versi <= 0 ? "1" : selectedProyek.versi
                }`}
              >
                {"Penawaran ==>>"}
              </NavLinkNewTab>
            </div> */}
          </>
        )}
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
          <div className="flex flex-col">
            <div>Aktivitas Sales</div>
            {!id && (
              <>
                <div>Filter :</div>
                <SelectStatusProyek
                  select={selectStatusProyek}
                  setSelect={setSelectStatusProyek}
                />
              </>
            )}
          </div>
        }
      >
        <TableHeader columns={col.aktivitassales}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={aktivitassales.data}>
          {(item) => (
            <TableRow key={item.id_pengeluaranproyek}>
              {(columnKey) => (
                <TableCell>
                  {renderCell.aktivitassales(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* edit aktivitassales */}
      <Modal
        scrollBehavior="inside"
        isOpen={modal.aktivitassales.isOpen}
        onOpenChange={modal.aktivitassales.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.method == "POST" ? "Tambah" : "Edit"} Aktivitas Sales
              </ModalHeader>
              <ModalBody>
                <div className="bg-gray-100 p-3 rounded-lg z-50 w-fit border">
                  <div>Tanggal</div>
                  <DatePicker
                    className="bg-white"
                    placeholderText="Pilih tanggal"
                    dateFormat="dd/MM/yyyy"
                    selected={
                      form.tanggal ? new Date(form.tanggal) : new Date()
                    }
                    onChange={(v) => setForm({ ...form, tanggal: getDate(v) })}
                  />
                </div>
                <Select
                  variant="bordered"
                  label="Karyawan"
                  placeholder="Pilih karyawan!"
                  className=""
                  selectedKeys={
                    new Set(form.id_karyawan ? [String(form.id_karyawan)] : [])
                  }
                  onSelectionChange={(v) =>
                    setForm({
                      ...form,
                      id_karyawan: v.values().next().value,
                    })
                  }
                >
                  {karyawan.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Textarea
                  variant="bordered"
                  value={form.aktivitas}
                  label="Aktivitas"
                  placeholder="Masukkan aktivitas!"
                  className=""
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      aktivitas: v,
                    })
                  }
                />
                <Textarea
                  variant="bordered"
                  value={form.catatan}
                  label="Catatan"
                  placeholder="Masukkan catatan!"
                  className=""
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      catatan: v,
                    })
                  }
                />
                <Textarea
                  variant="bordered"
                  value={form.output}
                  label="Output"
                  placeholder="Masukkan output!"
                  className=""
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      output: v,
                    })
                  }
                />
                <Textarea
                  variant="bordered"
                  value={form.tindakanselanjutnya}
                  label="Tindakan Selanjutnya"
                  placeholder="Masukkan tindakanselanjutnya!"
                  className=""
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      tindakanselanjutnya: v,
                    })
                  }
                />
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
    </div>
  );
}
