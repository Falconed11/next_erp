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

const api_path = getApiPath();

export default function App({ id }) {
  const componentRef = {
    nota: useRef(),
  };
  const handlePrintNota = useReactToPrint({
    content: () => componentRef.nota.current,
    pageStyle: "p-10",
  });

  const [selectKategori, setSelectKategori] = useState(new Set([]));
  const [selectProduk, setSelectProduk] = useState(new Set([]));
  const karyawan = useClientFetch(`karyawan`);
  const [selectKaryawan, setSelectKaryawan] = useState("");
  const [form, setForm] = useState({
    startdate: new Date(),
    selectKategori: new Set([]),
    selectProduk: new Set([]),
  });
  const [formPembayaran, setFormPembayaran] = useState({});

  const proyek = useClientFetch(`proyek?id=${id}`);
  const pengeluaranproyek = useClientFetch(`pengeluaranproyek?id_proyek=${id}`);
  const pembayaranproyek = useClientFetch(`pembayaranproyek?id_proyek=${id}`);
  const kategori = useClientFetch(`kategoriproduk`);
  const bank = useClientFetch(`bank`);
  const produk = useClientFetch(
    `produk?kategori=${selectKategori.values().next().value}`
  );

  const editButtonPress = (data) => {
    const startdate = new Date(data.tanggalpengeluaran);
    setForm({
      ...form,
      ...data,
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
        console.log(res);
        console.log(res.status);
        const json = await res.json();
        console.log(json);
        if (res.status == 400) return alert(json.message);
      }
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
          id_karyawan: selectKaryawan.values().next().value,
          id_vendor: form.selectVendor,
          tanggal: form.startdate ? getDate(form.startdate) : "",
          jumlah: form.jumlah,
          harga: form.harga,
          keterangan: form.keterangan ? form.keterangan : "",
          status: form.status ? form.status : "",
        }),
      });
    }
    console.log(res);
    console.log(res.status);
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
    // return alert(json.message);
  };
  const simpanButtonPress = async (data, onClose) => {
    if (data.id_produkkeluar) {
      console.log("ada");
      return;
    }
    const res = await fetch(`${api_path}pengeluaranproyek`, {
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
    onClose();
    // console.log(json.message);
  };

  const editButtonPressPembayaran = (data) => {
    const startdate = new Date(data.tanggal);
    setFormPembayaran({
      ...data,
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
      nominal: 0,
    });
  };
  const simpanButtonPressPembayaran = async (data, onClose) => {
    const res = await fetch(`${api_path}pembayaranproyek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...data,
        // harga: data.hargajual,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    setFormPembayaran({ nominal: "" });
    onClose();
    // return alert(json.message);
  };

  const renderCell = {
    pengeluaranproyek: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      const harga = data.hargapengeluaran;
      switch (columnKey) {
        case "status":
          return data.status == 1 ? "Lunas" : "Belum Lunas";
        case "tanggal":
          return getDateF(new Date(data.tanggalpengeluaran));
        case "harga":
          return <Harga harga={harga} />;
        case "totalharga":
          return <Harga harga={data.jumlah * harga} />;
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
    }, []),
    pembayaranproyek: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "tanggal":
          return getDateF(new Date(data.tanggal));
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
        key: "nominal",
        label: "Nominal",
      },
      {
        key: "metodepembayaran",
        label: "Metode Pembayaran",
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

  if (proyek.error) return <div>failed to load</div>;
  if (proyek.isLoading) return <div>loading...</div>;
  if (pengeluaranproyek.error) return <div>failed to load</div>;
  if (pengeluaranproyek.isLoading) return <div>loading...</div>;
  if (pembayaranproyek.error) return <div>failed to load</div>;
  if (pembayaranproyek.isLoading) return <div>loading...</div>;
  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  if (produk.error) return <div>failed to load</div>;
  if (produk.isLoading) return <div>loading...</div>;
  if (karyawan.error) return <div>failed to load</div>;
  if (karyawan.isLoading) return <div>loading...</div>;
  if (bank.error) return <div>failed to load</div>;
  if (bank.isLoading) return <div>loading...</div>;

  const selectedProyek = proyek.data[0];
  // const subTotalHargaJual = keranjangNota.data.reduce((total, currentValue) => {
  //   return total + currentValue.jumlah * currentValue.hargajual;
  // }, 0);
  // const subTotalKustomJual = keranjangNota.data.reduce(
  //   (total, currentValue) => {
  //     return (
  //       total +
  //       currentValue.jumlah *
  //         (currentValue.hargakustom
  //           ? currentValue.hargakustom
  //           : currentValue.hargajual)
  //     );
  //   },
  //   0
  // );
  const biayaProduksi = pengeluaranproyek.data.reduce((total, v) => {
    return (
      total +
      v.jumlah * (v.hargapengeluaran ? v.hargapengeluaran : v.hargamodal)
    );
  }, 0);
  const omset = pembayaranproyek.data.reduce((total, v) => {
    return total + v.nominal;
  }, 0);
  const provit = omset - biayaProduksi;

  const PembayaranProyek = (
    <>
      <div className="bg-gray-100 p-3 rounded-lg">
        <div>Tanggal</div>
        <DatePicker
          placeholderText="Pilih tanggal"
          dateFormat="dd/MM/yyyy"
          selected={formPembayaran.startdate}
          onChange={(v) => {
            setFormPembayaran({
              ...formPembayaran,
              startdate: v,
              tanggal: getDate(v),
            });
          }}
        />
      </div>
      <Input
        type="number"
        label="Nominal"
        value={formPembayaran.nominal}
        placeholder="Masukkan nominal!"
        className=""
        onValueChange={(v) =>
          setFormPembayaran({
            ...formPembayaran,
            nominal: v,
          })
        }
      />
      <Select
        label="Metode Pembayaran"
        placeholder="Pilih metode pembayaran!"
        className=""
        selectedKeys={formPembayaran.selectMetodePembayaran}
        onSelectionChange={(v) => {
          setFormPembayaran({
            ...formPembayaran,
            selectMetodePembayaran: v,
            id_metodepembayaran: new Set(v).values().next().value,
          });
        }}
      >
        {bank.data.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.nama}
          </SelectItem>
        ))}
      </Select>
      <Input
        type="text"
        label="Keterangan"
        placeholder="Masukkan keterangan!"
        value={formPembayaran.keterangan}
        className=""
        onValueChange={(v) =>
          setFormPembayaran({
            ...formPembayaran,
            keterangan: v,
          })
        }
      />
    </>
  );
  return (
    <div className="flex flex-col w-full">
      <h1>Proses</h1>
      <div className="flex flex-row gap-2">
        {/*Detail  */}
        <div className="bg-white rounded-lg p-3">
          <div>Detail</div>
          <div className="flex">
            <div>
              <div>No.</div>
              <div>Tanggal</div>
              <div>Klien</div>
              <div>Instansi</div>
              <div>Nama Proyek</div>
              <div>Biaya Produksi</div>
              <div>Omset</div>
              <div>Provit</div>
            </div>
            <div>
              <div>: {selectedProyek.id_kustom}</div>
              <div>: {getDateFId(new Date(selectedProyek.tanggal))} </div>
              <div>: {selectedProyek.klien} </div>
              <div>: {selectedProyek.instansi} </div>
              <div>: {selectedProyek.nama} </div>
              <div>
                : <Harga harga={biayaProduksi} />
              </div>
              <div>
                : <Harga harga={omset} />
              </div>
              <div>
                : <Harga harga={provit} />
              </div>
            </div>
          </div>
        </div>
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
        className="pt-3"
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div>Pengeluaran Proyek</div>
            <div className="flex-col gap-2">
              <div className="flex flex-row gap-2">
                {/* <Select
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
                      {item.nama} | {item.merek} | {item.tipe} | {item.stok} |{" "}
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
                /> */}
                <TambahProduk
                  form={form}
                  setForm={setForm}
                  disableHargaKustom
                  refHargaModal
                />
              </div>
              <div className="flex flex-row gap-2 mt-3 z-40">
                <div className="bg-gray-100 p-3 rounded-lg">
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
        // bottomContent={
        //   <>
        //     <div className="text-right">
        //       <div>
        //         <Harga label="Sub Total Harga Jual :" harga={0} />
        //       </div>
        //     </div>
        //   </>
        // }
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
      {/* tabel pembayaranproyek */}
      <Table
        className="pt-3"
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div>Pembayaran Proyek</div>
            <div className="flex-col gap-2">
              <div className="flex flex-row gap-2 mt-3">
                {PembayaranProyek}
                <Button
                  onClick={() => {
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
        // bottomContent={
        //   <>
        //     <div className="text-right">
        //       <div>
        //         <Harga label="Sub Total Harga Jual :" harga={0} />
        //       </div>
        //     </div>
        //   </>
        // }
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
        <TableBody items={pembayaranproyek.data}>
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
                {/* <div>Harga Modal : {form.hargamodal}</div> */}
                <Input
                  type="number"
                  disabled
                  value={form.harga}
                  label="Harga Satuan"
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
              <ModalBody>{PembayaranProyek}</ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
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
