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
} from "@/components/icon";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { useReactToPrint } from "react-to-print";
import {
  getApiPath,
  useClientFetch,
  useClientFetchNoInterval,
} from "@/app/utils/apiconfig";
import { getDateFId } from "@/app/utils/date";
import { penawaran } from "@/app/utils/formatid";
import Harga from "@/components/harga";
import { ConditionalComponent } from "@/components/componentmanipulation";
import TambahProduk from "@/components/tambahproduk";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Divider } from "@nextui-org/react";
import { Spacer } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { CheckboxGroup, Checkbox } from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";
import logoBks from "@/public/logo-bks.jpeg";
import logoSvt from "@/public/logo-svt.jpeg";
import { useRouter } from "next/navigation";

const api_path = getApiPath();

export default function App({ id, versi }) {
  const router = useRouter();
  const componentRef = {
    penawaran: useRef(),
    invoice: useRef(),
  };
  const handlePrintInvoice = useReactToPrint({
    content: () => componentRef.invoice.current,
    bodyClass: "m-12",
  });
  const handlePrintPenawaran = useReactToPrint({
    content: () => componentRef.penawaran.current,
    pageStyle: "p-10 block",
  });

  const [selectVersi, setSelectVersi] = useState(new Set(versi ? [versi] : []));
  const [selected, setSelected] = React.useState(["audio", "multimedia"]);
  const proyek = useClientFetch(`proyek?id=${id}`);
  const keranjangProyek = useClientFetch(
    `keranjangproyek?id_proyek=${id}&instalasi=0&versi=${
      selectVersi.values().next().value
    }`
  );
  const keranjangProyekInstalasi = useClientFetch(
    `keranjangproyek?id_proyek=${id}&instalasi=1&versi=${
      selectVersi.values().next().value
    }`
  );
  const rekapitulasiProyek = useClientFetch(
    `rekapitulasiproyek?id_proyek=${id}&versi=${
      selectVersi.values().next().value
    }`
  );
  const versiKeranjangProyek = useClientFetch(
    `versikeranjangproyek?id_proyek=${id}`
  );
  const [form, setForm] = useState({
    selectProduk: new Set([]),
    selectKategori: new Set([]),
  });
  const [formInstalasi, setFormInstalasi] = useState({
    selectProduk: new Set([]),
    selectKategori: new Set([]),
  });
  const [formRekapitulasi, setFormRekapitulasi] = useState({ hargadiskon: 0 });

  const tambahButtonPress = async (form, setForm) => {
    if (form.selectProduk.size == 0) return alert("Silahkan pilih produk");
    const res = await fetch(`${api_path}keranjangproyek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id_proyek: id,
        id_produk: form.selectProduk,
        jumlah: form.jumlah,
        harga: form.harga,
        instalasi: form.instalasi,
        versi,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    setForm({ jumlah: "", harga: "" });
    // console.log(json.message);
    // return alert(json.message);
  };
  const editButtonPress = (data) => {
    setForm({
      ...data,
      harga: data.hargakustom,
      profit: data.hargajual - data.harga,
    });
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
      return;
      // return alert(json.message);
    }
  };
  const handleButtonVersi = async () => {
    let res = await fetch(`${api_path}versibarukeranjangproyek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id_proyek: id,
        versi: selectVersi.values().next().value,
        // harga: data.hargajual,
      }),
    });
    let json = await res.json();
    res = await fetch(`${api_path}versibarurekapitulasiproyek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id_proyek: id,
        versi: selectVersi.values().next().value,
        // harga: data.hargajual,
      }),
    });
    json = await res.json();
    const newVersion =
      versiKeranjangProyek.data.reduce((acc, v) => {
        const versi = v.versi;
        return versi > acc ? versi : acc;
      }, 0) + 1;
    router.push(`/proyek/detail?id=${id}&versi=${newVersion}`);
    setSelectVersi(new Set([String(newVersion)]));
    // return alert(json.message);
  };
  const simpanButtonPress = async (data, onClose) => {
    const res = await fetch(`${api_path}keranjangproyek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id: data.id_keranjangproyek,
        jumlah: data.jumlah,
        harga: data.harga,
        // harga: data.hargajual,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    onClose();
    // console.log(json.message);
    //return alert(json.message);
  };
  const handleButtonEdit = () => {
    // setFormRekapitulasi({
    //   hargaDiskon: totalHarga - diskon,
    //   diskon,
    //   pajak,
    // });
    // console.log(formRekapitulasi);
    setFormRekapitulasi({
      ...formRekapitulasi,
      id,
      diskon: rekapDiskon,
      hargadiskon: totalHarga - rekapDiskon,
      pajak: rekapPajak,
      versi: selectedVersion,
    });
    modal.rekapitulasi.onOpen();
  };
  const handleButtonEditJenisProyek = () => {
    // setFormRekapitulasi({
    //   hargaDiskon: totalHarga - diskon,
    //   diskon,
    //   pajak,
    // });
    // console.log(formRekapitulasi);
    setSelected(kategoriProyek);
    modal.jenisproyek.onOpen();
  };
  const handleButtonSimpanRekapitulasi = async (data, onClose) => {
    console.log(rekapitulasiProyek.data.length);
    const method = rekapitulasiProyek.data.length == 0 ? "POST" : "PUT";
    const res = await fetch(`${api_path}rekapitulasiproyek`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...data,
        id: selectedRekapitulasiProyek ? selectedRekapitulasiProyek.id : null,
        id_proyek: id,
        versi: selectedVersion,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    onClose();
    // return alert(json.message);
  };
  const handleButtonSimpanJenisProyek = async (data, onClose) => {
    const method = rekapitulasiProyek.data.length == 0 ? "POST" : "PUT";
    const res = await fetch(`${api_path}jenisproyek`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        jenis_proyek: data,
        id: selectedRekapitulasiProyek ? selectedRekapitulasiProyek.id : null,
        id_proyek: id,
        versi: selectedVersion,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    onClose();
    // return alert(json.message);
  };
  const handleButtonSetAsDealClick = async () => {
    const res = await fetch(`${api_path}updateversiproyek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id,
        versi: selectedVersion,
      }),
    });
    const json = await res.json();
    // console.log(json.message);
    // return alert(json.message);
  };
  const handleButtonCancelDealClick = async () => {
    const res = await fetch(`${api_path}updateversiproyek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id,
        versi: 0,
      }),
    });
    const json = await res.json();
    // console.log(json.message);
    // return alert(json.message);
  };
  const handleButtonSetAsRejectClick = async () => {
    const res = await fetch(`${api_path}updateversiproyek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id,
        versi: -1,
      }),
    });
    const json = await res.json();
    // console.log(json.message);
    // return alert(json.message);
  };
  const handleButtonCancelRejectClick = async () => {
    const res = await fetch(`${api_path}updateversiproyek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id,
        versi: 0,
      }),
    });
    const json = await res.json();
    // console.log(json.message);
    // return alert(json.message);
  };
  const renderCell = {
    keranjangproyek: React.useCallback((data, columnKey) => {
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
      let harga = data.hargakustom ? data.hargakustom : data.hargajual;
      switch (columnKey) {
        case "jumlah":
          return `${data.jumlah} ${data.satuan}`;
        case "hargajual":
          return (
            <div className="text-right">{harga.toLocaleString("id-ID")}</div>
          );
        case "total":
          return (
            <div className="text-right">
              {(data.jumlah * harga).toLocaleString("id-ID")}
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
    rekapitulasi: useDisclosure(),
    jenisproyek: useDisclosure(),
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
  if (keranjangProyek.error) return <div>failed to load keranjang proyek</div>;
  if (keranjangProyek.isLoading) return <div>loading...</div>;
  if (keranjangProyekInstalasi.error)
    return <div>failed to load keranjang instalasi</div>;
  if (keranjangProyekInstalasi.isLoading) return <div>loading...</div>;
  if (rekapitulasiProyek.error) return <div>failed to load rekapitulasi</div>;
  if (rekapitulasiProyek.isLoading) return <div>loading...</div>;
  if (versiKeranjangProyek.error) return <div>failed to load</div>;
  if (versiKeranjangProyek.isLoading) return <div>loading...</div>;
  const dataPenawaran = keranjangProyek.data.map((produk, i) => {
    return { ...produk, no: i + 1 };
  });
  const dataInstalasi = keranjangProyekInstalasi.data.map((produk, i) => {
    return { ...produk, no: i + 1 };
  });
  const selectedProyek = proyek.data[0];

  const col = {
    keranjangproyek: [
      {
        key: "kategoriproduk",
        label: "Kategori",
      },
      {
        key: "nama",
        label: "Nama",
      },
      {
        key: "nmerek",
        label: "Merek",
      },
      {
        key: "tipe",
        label: "Tipe",
      },
      {
        key: "nvendor",
        label: "Vendor",
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
        key: "hargakustom",
        label: "Harga Kustom",
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
        key: "nmerek",
        label: "Merek",
      },
      {
        key: "tipe",
        label: "Tipe",
      },
      {
        key: "nvendor",
        label: "Vendor",
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
        key: "hargakustom",
        label: "Harga Kustom",
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

  if (selectedProyek.versi == 0) {
    col.keranjangproyek.push({
      key: "aksi",
      label: "Aksi",
    });
    col.instalasi.push({
      key: "aksi",
      label: "Aksi",
    });
  }
  const selectedRekapitulasiProyek = rekapitulasiProyek.data[0];
  const kategoriProyek = [];
  if (selectedRekapitulasiProyek) {
    if (selectedRekapitulasiProyek.audio) kategoriProyek.push("audio");
    if (selectedRekapitulasiProyek.cctv) kategoriProyek.push("cctv");
    if (selectedRekapitulasiProyek.multimedia)
      kategoriProyek.push("multimedia");
  }
  const rekapDiskon = selectedRekapitulasiProyek
    ? selectedRekapitulasiProyek.diskon
    : 0;
  const rekapPajak = selectedRekapitulasiProyek
    ? selectedRekapitulasiProyek.pajak
    : 0;
  const keteranganPajak = rekapPajak ? "sudah" : "tidak";
  let totalModalProduk = 0;
  if (keranjangProyek.data.length > 0) {
    totalModalProduk = keranjangProyek.data.reduce((total, harga) => {
      return total + harga.jumlah * harga.hargamodal;
    }, 0);
  }
  let totalModalInstalasi = 0;
  if (keranjangProyekInstalasi.data.length > 0) {
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
  const subTotalKustomJual = keranjangProyek.data.reduce(
    (total, currentValue) => {
      return (
        total +
        currentValue.jumlah *
          (currentValue.hargakustom ?? currentValue.hargajual)
      );
    },
    0
  );
  const subTotalHargaInstalasi = keranjangProyekInstalasi.data.reduce(
    (total, currentValue) => {
      return total + currentValue.jumlah * currentValue.hargajual;
    },
    0
  );
  const subTotalKustomInstalasi = keranjangProyekInstalasi.data.reduce(
    (total, currentValue) => {
      return (
        total +
        currentValue.jumlah *
          (currentValue.hargakustom ?? currentValue.hargajual)
      );
    },
    0
  );
  const totalHarga = subTotalHargaJual + subTotalHargaInstalasi;
  const totalKustom = subTotalKustomJual + subTotalKustomInstalasi;
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
  const diskonPersen = (rekapDiskon / totalHarga) * 100;
  const hargaDiskon = totalHarga - rekapDiskon;
  const kustomDiskon = totalKustom - rekapDiskon;
  const pajak = (hargaDiskon * rekapPajak) / 100;
  const pajakKustom = (kustomDiskon * rekapPajak) / 100;
  const finalHarga = hargaDiskon + pajak;
  const finalKustom = kustomDiskon + pajakKustom;
  const selectedVersion = selectVersi.values().next().value;
  return (
    <div>
      <div className="flex flex-row gap-2">
        {/*Detail  */}
        <div className="bg-white rounded-lg p-3">
          <div>Detail</div>
          {versiKeranjangProyek.data.length > 1 ? (
            <Select
              label="Versi"
              placeholder="Pilih versi!"
              selectedKeys={selectVersi}
              onSelectionChange={setSelectVersi}
            >
              {versiKeranjangProyek.data.map((item) => (
                <SelectItem key={item.versi} value={item.versi}>
                  {`${item.versi} ${
                    item.versi == selectedProyek.versi ? "(deal)" : ""
                  }`}
                </SelectItem>
              ))}
            </Select>
          ) : (
            <></>
          )}
          <div className="flex">
            <div>
              <div>No.</div>
              <div>Perusahaan</div>
              <div>Nama Proyek{"  "}</div>
              <div>Tanggal</div>
              <div>Klien</div>
              <div>Instansi</div>
              <div>Kota</div>
              <div>Sales</div>
              <div>Status</div>
            </div>
            <div>
              <div>
                :{" "}
                {penawaran(
                  selectedProyek.id_kustom,
                  new Date(selectedProyek.tanggal),
                  selectedProyek.id_karyawan
                )}{" "}
              </div>
              <div>: {selectedProyek.namaperusahaan} </div>
              <div>: {selectedProyek.nama} </div>
              <div>: {getDateFId(new Date(selectedProyek.tanggal))} </div>
              <div>: {selectedProyek.klien} </div>
              <div>: {selectedProyek.instansi} </div>
              <div>: {selectedProyek.kota} </div>
              <div>: {selectedProyek.namakaryawan} </div>
              <div>
                :{" "}
                {selectedProyek.versi == -1 ? (
                  <span className="bg-red-600 text-white p-1 rounded font-bold">
                    REJECT
                  </span>
                ) : selectedProyek.versi == selectedVersion ? (
                  <span className="bg-green-400 text-white p-1 rounded font-bold">
                    DEAL
                  </span>
                ) : (
                  "penawaran"
                )}
              </div>
            </div>
          </div>
        </div>
        <ConditionalComponent
          condition={selectVersi.size}
          component={
            <>
              {/* rekapitulasi */}
              <div className="bg-white rounded-lg p-3 w-1/3">
                <div>Rekapitulasi</div>
                <div className="flex">
                  <div className="basis-2/4">
                    <div>Sub Total Harga</div>
                    <div>Maks Diskon</div>
                    <div>Diskon</div>
                    <div>Harga Setelah Diskon</div>
                    <div>Pajak ({selectedProyek.pajak}%)</div>
                    <div>Harga Setelah Pajak</div>
                  </div>
                  <div className="basis-2/4">
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
                        harga={rekapDiskon}
                        endContent={`(${diskonPersen.toFixed(2)}%)`}
                      />
                    </div>
                    <div>
                      : <Harga harga={hargaDiskon} />
                    </div>
                    <div>
                      : <Harga harga={pajak} />
                    </div>
                    <div>
                      : <Harga harga={finalHarga} />
                    </div>
                    <ConditionalComponent
                      condition={selectedProyek.versi == 0}
                      component={
                        <Button
                          onClick={handleButtonEdit}
                          color="primary"
                          className="float-right mt-3"
                        >
                          Edit
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
              {/* jenis proyek */}
              <div className="bg-white rounded-lg p-3">
                <div>Jenis Proyek</div>
                <div>{kategoriProyek.join(", ")}</div>
                <ConditionalComponent
                  condition={selectedProyek.versi == 0}
                  component={
                    <Button
                      onClick={handleButtonEditJenisProyek}
                      color="primary"
                    >
                      Edit
                    </Button>
                  }
                />
              </div>
            </>
          }
        />
      </div>
      <ConditionalComponent
        condition={selectVersi.size}
        component={
          <>
            {/* tombol fungsional */}
            <div className="flex flex-row gap-2">
              {/* <div>
                <Button
                  onClick={handleButtonVersi}
                  color="primary"
                  className="mt-3"
                >
                  Buat Versi Baru
                </Button>
              </div> */}
              <div>
                <Button
                  onClick={modal.penawaran.onOpen}
                  color="primary"
                  className="mt-3"
                >
                  Penawaran
                </Button>
              </div>
              {selectedProyek.versi != selectedVersion ? (
                <div>
                  <Button
                    onClick={handleButtonSetAsDealClick}
                    color="primary"
                    className="mt-3"
                  >
                    Set as Deal
                  </Button>
                </div>
              ) : (
                <div>
                  <Button
                    onClick={handleButtonCancelDealClick}
                    color="primary"
                    className="mt-3"
                  >
                    Cancel Deal
                  </Button>
                </div>
              )}
              {selectedProyek.versi != -1 ? (
                <div>
                  <Button
                    onClick={handleButtonSetAsRejectClick}
                    color="primary"
                    className="mt-3"
                  >
                    Set as Reject
                  </Button>
                </div>
              ) : (
                <div>
                  <Button
                    onClick={handleButtonCancelRejectClick}
                    color="primary"
                    className="mt-3"
                  >
                    Cancel Reject
                  </Button>
                </div>
              )}
              {selectedProyek.versi > 0 ? (
                <Link
                  className="text-blue-600 p-3"
                  href={`/proyek/detail/proses?id=${selectedProyek.id}`}
                >{`Pengeluaran Proyek ==>>`}</Link>
              ) : (
                <></>
              )}
              {/* <div>
            <Button
              onClick={modal.invoice.onOpen}
              color="primary"
              className="mt-3"
            >
              Invoice
            </Button>
          </div> */}
            </div>
            <div className="-w-11/12">
              {/* tabel produk */}
              <Table
                selectionMode="single"
                className="pt-3"
                topContent={
                  <>
                    <div>Produk</div>
                    <ConditionalComponent
                      condition={selectedProyek.versi == 0}
                      component={
                        <div className="flex flex-row gap-2">
                          <TambahProduk form={form} setForm={setForm} />
                          <Button
                            onClick={() => {
                              tambahButtonPress(form, setForm);
                            }}
                            color="primary"
                          >
                            Tambah
                          </Button>
                        </div>
                      }
                    />
                  </>
                }
                bottomContent={
                  <>
                    <div className="text-right">
                      <div>
                        <Harga
                          harga={keranjangProyek.data.reduce(
                            (total, currentValue) => {
                              return (
                                total +
                                currentValue.jumlah * currentValue.hargamodal
                              );
                            },
                            0
                          )}
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
                          harga={keranjangProyek.data.reduce(
                            (total, currentValue) => {
                              return (
                                total +
                                currentValue.jumlah *
                                  (currentValue.hargajual -
                                    currentValue.hargamodal)
                              );
                            },
                            0
                          )}
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
                selectionMode="single"
                topContent={
                  <>
                    <div>Instalasi</div>
                    <ConditionalComponent
                      condition={selectedProyek.versi == 0}
                      component={
                        <div className="flex flex-row gap-2">
                          <TambahProduk
                            form={formInstalasi}
                            setForm={setFormInstalasi}
                          />
                          <Button
                            onClick={() => {
                              tambahButtonPress(
                                {
                                  ...formInstalasi,
                                  instalasi: 1,
                                },
                                setFormInstalasi
                              );
                            }}
                            color="primary"
                          >
                            Tambah
                          </Button>
                        </div>
                      }
                    />
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
                                total +
                                currentValue.jumlah * currentValue.hargamodal
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
                                  (currentValue.hargajual -
                                    currentValue.hargamodal)
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
            </div>
          </>
        }
      />
      {/* edit rekapitulasi */}
      <Modal
        scrollBehavior="inside"
        isOpen={modal.rekapitulasi.isOpen}
        onOpenChange={modal.rekapitulasi.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Rekapitulasi
              </ModalHeader>
              <ModalBody>
                <div>
                  Sub Total Harga : <Harga harga={totalHarga} />
                </div>
                <div>
                  Maks Diskon :{" "}
                  <Harga
                    label={``}
                    harga={maksDiskon}
                    endContent={`(${maksDiskonPersen.toFixed(2)}%)`}
                  />
                </div>
                <Input
                  type="number"
                  value={formRekapitulasi.diskon}
                  label="Diskon"
                  placeholder="Masukkan diskon!"
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">
                        (
                        {((formRekapitulasi.diskon / totalHarga) * 100).toFixed(
                          2
                        )}
                        %)
                      </span>
                    </div>
                  }
                  onValueChange={(v) =>
                    setFormRekapitulasi({
                      ...formRekapitulasi,
                      diskon: v,
                      hargadiskon: totalHarga - v,
                    })
                  }
                />
                <Input
                  type="number"
                  value={formRekapitulasi.hargadiskon}
                  label="Harga Setelah Diskon"
                  placeholder="Masukkan harga diskon!"
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">
                        <Harga harga={formRekapitulasi.hargadiskon} />
                      </span>
                    </div>
                  }
                  onValueChange={(v) =>
                    setFormRekapitulasi({
                      ...formRekapitulasi,
                      hargadiskon: v,
                      diskon: totalHarga - v,
                    })
                  }
                />
                <Input
                  type="number"
                  value={formRekapitulasi.pajak}
                  label="Pajak (%)"
                  placeholder="Masukkan pajak!"
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">
                        <Harga
                          harga={
                            (formRekapitulasi.pajak *
                              (totalHarga - formRekapitulasi.diskon)) /
                            100
                          }
                        />
                      </span>
                    </div>
                  }
                  onValueChange={(v) =>
                    setFormRekapitulasi({
                      ...formRekapitulasi,
                      pajak: v,
                    })
                  }
                />
                <div>
                  Total Harga :{" "}
                  <Harga
                    harga={
                      (formRekapitulasi.hargadiskon *
                        (100 + parseInt(formRekapitulasi.pajak))) /
                      100
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() =>
                    handleButtonSimpanRekapitulasi(formRekapitulasi, onClose)
                  }
                >
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* edit jenis proyek */}
      <Modal
        scrollBehavior="inside"
        isOpen={modal.jenisproyek.isOpen}
        onOpenChange={modal.jenisproyek.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Jenis Proyek
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-3">
                  <CheckboxGroup
                    label="Pilih jenis proyek"
                    color="warning"
                    value={selected}
                    onValueChange={setSelected}
                  >
                    <Checkbox value="audio">Audio</Checkbox>
                    <Checkbox value="cctv">CCTV</Checkbox>
                    <Checkbox value="multimedia">Multimedia</Checkbox>
                  </CheckboxGroup>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() =>
                    handleButtonSimpanJenisProyek(selected, onClose)
                  }
                >
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
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
                <div>Merek : {form.nmerek}</div>
                <div>Tipe : {form.tipe}</div>
                <div>Vendor : {form.nvendor}</div>
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
                    {selectedProyek.id_perusahaan == 1 ? (
                      <>
                        <Image
                          src={logoBks}
                          alt="Company Logo"
                          width={70}
                          // height={500} automatically provided
                          // blurDataURL="data:..." automatically provided
                          // placeholder="blur" // Optional blur-up while loading
                        />
                        <div className="flex flex-col pl-2">
                          <div>Belga Karya Semesta</div>
                          <div>
                            General Trading - Mechanical Electrical - Supplies -
                            Consultant
                          </div>
                          <div>
                            Jogokaryan MJ 3/789, Mantrijeron - Yogyakarta Telp
                            08121553765
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Image
                          src={logoSvt}
                          alt="Company Logo"
                          width={70}
                          // height={500} automatically provided
                          // blurDataURL="data:..." automatically provided
                          // placeholder="blur" // Optional blur-up while loading
                        />
                        <div className="flex flex-col pl-2">
                          <div>Satu Visi Teknikatama</div>
                          <div>
                            General Trading - Mechanical Electrical - Supplies -
                            Consultant
                          </div>
                          <div>
                            Wonosalam RT. 005 / RW. 009, Sukoharjo, Ngaglik
                            Sleman - Yogyakarta 55581 Telp 08121553765 -
                            081578861740
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <Divider className="bg-sky-500 my-3 py-2" />
                  {/* <hr className="my-3 bg-sky-500 h-5" /> */}
                  <div className="pt-3">
                    <div className="">
                      <div>
                        Yogyakarta,{" "}
                        {getDateFId(new Date(selectedProyek.tanggal))}
                      </div>
                      <div>
                        No :{" "}
                        {penawaran(
                          selectedProyek.id_kustom,
                          new Date(selectedProyek.tanggal),
                          selectedProyek.id_karyawan
                        )}
                        /{selectedVersion}
                      </div>
                      <br />
                      <div>Kepada Yth,</div>
                      <div>{selectedProyek.klien}</div>
                      <div>{selectedProyek.instansi}</div>
                      <div>{selectedProyek.kota}</div>
                    </div>
                    {/* <div className="basis-1/2 text-end">
                      <div>Id : ASD21903SAD</div>
                      <div>Tanggal : 17 Oktober 2023</div>
                    </div> */}
                    <br />
                    <div>Dengan Hormat,</div>
                    <div>
                      Sehubungan dengan adanya permintaan Bapak/Ibu, bersama ini
                      kami sampaikan penawaran harga/RAB di{" "}
                      {selectedProyek.instansi} {selectedProyek.kota}
                    </div>
                  </div>
                  {/* produk */}
                  <Table
                    className="mt-3 border"
                    aria-label="Example table with custom cells"
                    shadow="none"
                    topContent={<>Produk</>}
                    bottomContent={
                      <>
                        <div className="text-right">
                          Sub Total Harga :{" "}
                          {subTotalKustomJual.toLocaleString("id-ID")}
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
                  {/* instalasi */}
                  <Table
                    className="mt-3 border"
                    aria-label="Example table with custom cells"
                    shadow="none"
                    topContent={<>Instalasi</>}
                    bottomContent={
                      <>
                        <div className="text-right">
                          Sub Total Harga :{" "}
                          {subTotalKustomInstalasi.toLocaleString("id-ID")}
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
                    <TableBody items={dataInstalasi}>
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
                  <div className="mt-3 p-3 border no-break">
                    <div>Rekapitulasi</div>
                    <div className="flex">
                      <div className="basis-3/6"></div>
                      <div className="basis-2/6">
                        <div>Produk</div>
                        <div>Instalasi</div>
                        <div>Sub Total</div>
                        {rekapDiskon > 0 ? (
                          <>
                            <div>Diskon</div>
                            <div>Harga Setelah Diskon</div>
                          </>
                        ) : (
                          <></>
                        )}
                        <div>Pajak ({rekapPajak}%)</div>
                        <div>Harga Setelah Pajak</div>
                      </div>
                      <div className="basis-1/6 text-right">
                        <div>
                          <Harga harga={subTotalKustomJual} />
                        </div>
                        <div>
                          <Harga harga={subTotalKustomInstalasi} />
                        </div>
                        <div>
                          <Harga harga={totalKustom} />
                        </div>
                        {rekapDiskon > 0 ? (
                          <>
                            <div>{<Harga harga={rekapDiskon} />}</div>
                            <div>{<Harga harga={kustomDiskon} />}</div>
                          </>
                        ) : (
                          <></>
                        )}
                        <div>{<Harga harga={pajakKustom} />}</div>
                        <div>
                          <Harga harga={finalKustom} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* keterangan */}
                  <div className="flex flex-col mt-3">
                    <div className="no-break pb-3">
                      Keterangan <br />
                      - Harga belum termasuk instalasi pemasangan. <br />- Harga{" "}
                      {keteranganPajak} termasuk pajak-pajak. <br />
                      - Syarat pembayaran sesuai dengan kesepakatan kedua belah
                      pihak. <br />
                      - Waktu penyerahan barang sesuai jadwal yang disepakati
                      bersama. <br />- Harga tidak terikat dan dapat berubah
                      sewaktu-waktu.
                    </div>
                    <div className="no-break">
                      Demikian penawaran ini kami ajukan, sambil menantikan
                      pesanan Bapak/Ibu, kami ucapkan terima kasih. <br />{" "}
                      <br />
                      Hormat kami, <br /> <br />
                      {proyek.data[0].namakaryawan} <br /> <br /># Penawaran ini
                      dikeluarkan secara otomatis oleh sistem sehingga tidak
                      memerlukan tanda-tangan.
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
                  Tutup
                </Button>
                <Button onClick={handlePrintPenawaran} color="primary">
                  Cetak
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
                <Button onClick={handlePrintInvoice} color="primary">
                  Cetak
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

// const TambahProduk = ({ id_proyek, instalasi, versi }) => {
//   const kategori = useClientFetch(`kategoriproduk`);
//   const [selectKategori, setSelectKategori] = useState(new Set([]));
//   const produk = useClientFetch(
//     `produk?kategori=${selectKategori.values().next().value}`
//   );
//   const [selectProduk, setSelectProduk] = useState(new Set([]));
//   const [form, setForm] = useState({});
//   if (kategori.error) return <div>failed to load</div>;
//   if (kategori.isLoading) return <div>loading...</div>;
//   if (produk.error) return <div>failed to load</div>;
//   if (produk.isLoading) return <div>loading...</div>;
//   const tambahButtonPress = async ({ select, form }) => {
//     if (select.size == 0) return alert("Produk belum dipilih.");
//     const res = await fetch(`${api_path}keranjangproyek`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         // 'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: JSON.stringify({
//         id_proyek,
//         id_produk: select.values().next().value,
//         jumlah: form.jumlah,
//         harga: form.harga,
//         instalasi,
//         versi,
//       }),
//     });
//     const json = await res.json();
//     if (res.status == 400) return alert(json.message);
//     setForm({ jumlah: "", harga: "" });
//     setSelectKategori([]);
//     setSelectProduk([]);
//     // console.log(json.message);
//     // return alert(json.message);
//   };
//   return (
//     <div className="flex flex-row">
//       <Select
//         label="Kategori"
//         placeholder="Pilih kategori!"
//         className="w-2/12"
//         selectedKeys={selectKategori}
//         onSelectionChange={(v) => {
//           setSelectProduk(new Set([]));
//           setSelectKategori(v);
//         }}
//       >
//         {kategori.data.map((item) => (
//           <SelectItem key={item.kategori} value={item.kategori}>
//             {item.kategori}
//           </SelectItem>
//         ))}
//       </Select>
//       <Select
//         label="Produk"
//         placeholder="Pilih produk!"
//         className="w-5/12 pl-2"
//         selectedKeys={selectProduk}
//         onSelectionChange={setSelectProduk}
//       >
//         {produk.data.map((item) => (
//           <SelectItem
//             key={item.id}
//             value={item.id}
//             textValue={`${item.nama} | ${item.merek} | ${item.tipe} | ${item.stok} ${item.satuan} | ${item.hargamodal} | ${item.hargajual}`}
//           >
//             {item.nama} | {item.merek} | {item.tipe} |{" "}
//             <span className="p-1 bg-black text-white">
//               {item.stok} {item.satuan}
//             </span>{" "}
//             | <Harga harga={item.hargamodal} /> |{" "}
//             <Harga harga={item.hargajual} />
//           </SelectItem>
//         ))}
//       </Select>
//       <Input
//         type="number"
//         value={form.jumlah}
//         label="Jumlah"
//         placeholder="Masukkan jumlah!"
//         className="w-2/12 pl-2"
//         endContent={
//           <div className="pointer-events-none flex items-center">
//             <span className="text-default-400 text-small"></span>
//           </div>
//         }
//         onValueChange={(v) =>
//           setForm({
//             ...form,
//             jumlah: v,
//           })
//         }
//       />
//       <Input
//         type="number"
//         value={form.harga}
//         label="Harga Kustom"
//         placeholder="Masukkan harga!"
//         className="w-2/12 pl-2"
//         onValueChange={(v) =>
//           setForm({
//             ...form,
//             harga: v,
//           })
//         }
//       />
//       <Button
//         onClick={() => {
//           tambahButtonPress({ instalasi, select: selectProduk, form });
//         }}
//         color="primary"
//         className="ml-2"
//       >
//         Tambah
//       </Button>
//       {/* <div>
//                 <Link href={`/stok?id_proyek=${proyek.id}`}>
//                   <Button color="primary">Tambah</Button>
//                 </Link>
//               </div> */}
//     </div>
//   );
// };
