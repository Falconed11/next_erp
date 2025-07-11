"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableSection,
  TableCell,
  User,
  Chip,
  Tooltip,
  ChipProps,
  getKeyValue,
  NumberInput,
  Spinner,
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
import {
  getApiPath,
  useClientFetch,
  useClientFetchNoInterval,
} from "@/app/utils/apiconfig";
import { getDate, getDateF, getDateFId } from "@/app/utils/date";
import { invoice, penawaran } from "@/app/utils/formatid";
import { removePrefixIfMatchIgnoreCase } from "@/app/utils/stringmanipulation";
import Harga from "@/components/harga";
import { ConditionalComponent } from "@/components/componentmanipulation";
import TambahProduk from "@/components/tambahproduk";
import { BKSHeader, NavLinkNewTab, SVTHeader } from "@/components/mycomponent";
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import { Divider } from "@heroui/react";
import { Spacer } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import { CheckboxGroup, Checkbox } from "@heroui/react";
import { Form } from "@heroui/form";
import Link from "next/link";
import Image from "next/image";
import logoBks from "@/public/logo-bks.jpeg";
import logoSvt from "@/public/logo-svt.jpeg";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  countPercentProvit,
  countPriceByPercentProfit,
  countProvitMarginPercent,
} from "@/app/utils/formula";

const api_path = getApiPath();

export default function App({ id, versi }) {
  const session = useSession();
  const user = session.data?.user;
  const router = useRouter();
  const componentRef = {
    penawaran: useRef(null),
    invoice: useRef(),
  };
  const handlePrintInvoice = useReactToPrint({
    content: () => componentRef.invoice.current,
    bodyClass: "m-12",
  });
  const handlePrintPenawaran = useReactToPrint({
    contentRef: componentRef.penawaran,
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
  const keteranganPenawaran = useClientFetch(
    `keteranganpenawaran?idProyek=${id}`
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
  const subProyek = useClientFetch(`subproyek?id_proyek=${id}`);
  const [form, setForm] = useState({
    selectProduk: new Set([]),
    selectKategori: new Set([]),
  });
  const [formInstalasi, setFormInstalasi] = useState({
    selectProduk: new Set([]),
    selectKategori: new Set([]),
  });
  const [formRekapitulasi, setFormRekapitulasi] = useState({ hargadiskon: 0 });
  const PERSEN_PROVIT = 30;
  const [inputPersenProvit, setInputPersenProvit] = useState(PERSEN_PROVIT);
  const persenprovit =
    Math.round(
      countPercentProvit(form.temphargamodal || 0, form.harga || 0) * 100
    ) / 100;

  const tambahButtonPress = async (form, setForm) => {
    if (!form.selectProduk) return alert("Silahkan pilih produk");
    if (form.jumlah <= 0) return alert("Jumlah belum diisi");
    const res = await fetch(`${api_path}keranjangproyek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...form,
        id_proyek: id,
        id_subproyek: form.selectSubProyek?.values().next().value ?? 0,
        id_produk: form.selectProduk,
        jumlah: form.jumlah,
        harga: form.harga,
        instalasi: form.instalasi,
        hargakustom: form.hargakustom,
        versi,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    if (form.instalasi)
      setFormInstalasi({
        selectProduk: "",
        jumlah: "",
        harga: "",
        keterangan: "",
      });
    else setForm({ selectProduk: "", jumlah: "", harga: "" });
    // console.log(json.message);
    // return alert(json.message);
  };
  const editButtonPress = (data) => {
    console.log({ data });
    setForm({
      ...data,
      id: data.id_keranjangproyek,
      profit: data.harga - data.temphargamodal,
      oldHargaModal: data.temphargamodal,
      refHarga: data.harga,
      oldHarga: data.harga,
      provitmarginpersen: countProvitMarginPercent(
        data.temphargamodal,
        data.harga
      ),
      selectSubProyek: new Set(data.id_subproyek ? [data.id_subproyek] : [0]),
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
    // if (data.jumlah <= 0) return alert("Jumlah belum diisi");
    if (data.provitmarginpersen > 99)
      return alert("Provit margin tidak boleh lebi dari 99.");
    const res = await fetch(`${api_path}keranjangproyek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...data,
        id_subproyek: form.selectSubProyek?.values().next().value ?? 0,
        hargamodal: form.temphargamodal,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    onClose();
    // console.log(json.message);
    //return alert(json.message);
  };
  const terapkanButtonPress = async (e) => {
    e.preventDefault();
    if (!confirm("Anda yakin untuk merubah seluruh harga jual?")) return;
    // console.log({ id_proyek: id, provitmarginpersen: inputMargin });
    if (inputPersenProvit < 0) return alert("Persen provit tidak valid.");
    // if (data.jumlah <= 0) return alert("Jumlah belum diisi");
    const res = await fetch(
      `${api_path}keranjangproyekupdatehargabypersenprovit`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          id_proyek: id,
          persenProvit: inputPersenProvit,
        }),
      }
    );
    const json = await res.json();
    if (res.status >= 400 && res.status < 500) return alert(json.message);
    // alert(json);
    // console.log(json);
    return alert(json.message);
  };
  const handleButtonEdit = () => {
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
    setSelected(kategoriProyek);
    modal.jenisproyek.onOpen();
  };
  const handleButtonSimpanRekapitulasi = async (data, onClose) => {
    // console.log(rekapitulasiProyek.data.length);
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
        tanggal: getDate(new Date()),
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
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
        case "nama":
          return data.keterangan
            ? `${data.nama} (${data.keterangan})`
            : data.nama;
        case "stok":
          return (
            <div
              className={`text-right px-1 ${
                data.jumlah > data.stok ? "text-white bg-danger rounded-sm" : ""
              }`}
            >
              {cellValue}
            </div>
          );
        case "jumlah":
          return <div className="text-right">{cellValue}</div>;
        case "temphargamodal":
          return (
            <div className="text-right">
              <Harga harga={cellValue} />
            </div>
          );
        case "refhargajualmargin":
          return (
            <div className="text-right">
              <Harga harga={data.margin} />
            </div>
          );
        case "harga":
          return (
            <div className="text-right">
              <Harga harga={data.harga} />
            </div>
          );
        case "hargakustom":
          return data.hargakustom != null ? (
            <Harga harga={data.hargakustom} />
          ) : (
            ""
          );
        case "totalharga-modal":
          return (
            <div className="text-right">
              <Harga harga={data.jumlah * data.temphargamodal} />
            </div>
          );
        case "totalharga-jual":
          return (
            <div className="text-right">
              <Harga harga={data.jumlah * data.harga} />
            </div>
          );
        case "profit":
          return (
            <div className="text-right">
              <Harga harga={data.harga - data.temphargamodal} />
            </div>
          );
        case "provitmarginpersen":
          return (
            Math.round(
              ((data.harga - data.temphargamodal) / data.harga) * 100 * 100
            ) / 100
          );
        case "persenprovit":
          return (
            Math.round(
              countPercentProvit(data.temphargamodal, data.harga) * 100
            ) / 100
          );
        case "totalprofit":
          return (
            <div className="text-right">
              <Harga
                harga={
                  data.jumlah * data.harga - data.jumlah * data.temphargamodal
                }
              />
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
      let harga = data.hargakustom == null ? data.harga : data.hargakustom;
      switch (columnKey) {
        case "nmerek":
          return cellValue == "NN" ? "" : cellValue;
        case "tipe":
          return cellValue
            ? cellValue == "NN"
              ? ""
              : removePrefixIfMatchIgnoreCase(new String(cellValue), "svt-")
            : "";
        case "nama":
          return data.keterangan ? data.keterangan : data.nama;
        case "no":
          return data.jumlah ? data.no : <></>;
        case "jumlah":
          return data.jumlah ? (
            <div className="text-right">{data.jumlah}</div>
          ) : (
            <></>
          );
        case "hargajual":
          return data.jumlah ? (
            <div className="text-right">{harga.toLocaleString("id-ID")}</div>
          ) : (
            <></>
          );
        case "total":
          return data.jumlah ? (
            <div className="text-right">
              {(data.jumlah * harga).toLocaleString("id-ID")}
            </div>
          ) : (
            <></>
          );
        default:
          return cellValue;
      }
    }, []),
    invoice: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "deskripsiitem":
          return (
            <>
              {data.keterangan ? data.keterangan : data.nama}{" "}
              {data.nmerek == "NN" ? "" : data.nmerek} {data.tipe}
            </>
          );
        case "jumlah":
          return <div className="text-right">{cellValue}</div>;
        case "total":
          return (
            <div className="text-right">
              <Harga harga={data.jumlah * data.harga} />
            </div>
          );
        case "harga":
          return (
            <div className="text-right">
              <Harga harga={data.harga} />
            </div>
          );
        default:
          return cellValue;
      }
    }, []),
    keteranganpenawaran: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "deskripsiitem":
          return (
            <>
              {data.keterangan ? data.keterangan : data.nama}{" "}
              {data.nmerek == "NN" ? "" : data.nmerek} {data.tipe}
            </>
          );
        case "jumlah":
          return <div className="text-right">{cellValue}</div>;
        case "total":
          return (
            <div className="text-right">
              <Harga harga={data.jumlah * data.harga} />
            </div>
          );
        case "harga":
          return (
            <div className="text-right">
              <Harga harga={data.harga} />
            </div>
          );
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

  const dataPenawaran = keranjangProyek?.data
    ?.sort((a, b) => a.subproyek?.localeCompare(b?.subproyek))
    .map((produk, i) => {
      return {
        ...produk,
        no: i + 1,
      };
    });

  // Step 2: Insert rows before each group
  const result = [];
  let currentGroup = null;

  dataPenawaran?.forEach((item) => {
    if (item.subproyek !== currentGroup) {
      currentGroup = item.subproyek;
      result.push({ no: uuidv4(), nama: item.subproyek });
    }
    result.push(item);
  });

  const dataInstalasi = keranjangProyekInstalasi?.data
    ?.sort((a, b) => a.subproyek?.localeCompare(b?.subproyek))
    .map((produk, i) => {
      return {
        ...produk,
        no: i + 1,
      };
    });

  const resultInstalasi = [];
  let currentGroupInstalasi = null;

  dataInstalasi?.forEach((item) => {
    if (item.subproyek !== currentGroupInstalasi) {
      currentGroupInstalasi = item.subproyek;
      resultInstalasi.push({ no: uuidv4(), nama: item.subproyek });
    }
    resultInstalasi.push(item);
  });

  // console.log(dataPenawaran);
  // console.log(result);

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
  if (subProyek.error) return <div>failed to load</div>;
  if (subProyek.isLoading) return <div>loading...</div>;
  if (keteranganPenawaran.error) return <div>failed to load</div>;
  if (keteranganPenawaran.isLoading) return <div>loading...</div>;

  const keranjangProduk = keranjangProyek?.data.map((item) => ({
    ...item,
  }));
  const keranjangIntalasi = keranjangProyekInstalasi?.data.map((item) => ({
    ...item,
  }));

  const selectedProyek = proyek.data[0];
  const invoiceData = [
    ...keranjangProyek.data,
    ...keranjangProyekInstalasi.data,
  ].map((v, i) => ({ ...v, no: i + 1 }));

  const col = {
    keranjangproyek: [
      {
        key: "kategoriproduk",
        label: "Kategori",
      },
      {
        key: "subproyek",
        label: "Sub Proyek",
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
        key: "temphargamodal",
        label: "Harga Modal",
      },
      // {
      //   key: "refhargajualmargin",
      //   label: `Ref. Harga Jual Margin (${margin}%)`,
      // },
      {
        key: "harga",
        label: "Harga Jual",
      },
      {
        key: "profit",
        label: "Profit",
      },
      {
        key: "persenprovit",
        label: "%",
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
        key: "kategoriproduk",
        label: "Kategori",
      },
      {
        key: "subproyek",
        label: "Sub Proyek",
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
        key: "temphargamodal",
        label: "Harga Modal",
      },
      // {
      //   key: "refhargajualmargin",
      //   label: `Ref. Harga Jual Margin (${margin}%)`,
      // },
      {
        key: "harga",
        label: "Harga Instalasi",
      },
      {
        key: "profit",
        label: "Profit",
      },
      {
        key: "persenprovit",
        label: "%",
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
        key: "nmerek",
        label: "Merek",
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
        key: "satuan",
        label: "",
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
        key: "deskripsiitem",
        label: "Deskripsi Item",
      },
      {
        key: "jumlah",
        label: "Jumlah",
      },
      { key: "satuan" },
      {
        key: "harga",
        label: "Harga",
      },
      {
        key: "total",
        label: "Total",
      },
    ],
    keteranganpenawaran: [
      {
        key: "keterangan",
        label: "Keterangan",
      },
      {
        key: "aktif",
        label: "Aktif",
      },
      {
        key: "aksi",
        label: "Aksi",
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
      return total + harga.jumlah * harga.temphargamodal;
    }, 0);
  }
  let totalModalInstalasi = 0;
  if (keranjangProyekInstalasi.data.length > 0) {
    totalModalInstalasi = keranjangProyekInstalasi.data.reduce(
      (total, harga) => {
        return total + harga.jumlah * harga.temphargamodal;
      },
      0
    );
  }
  const totalModal = totalModalProduk + totalModalInstalasi;
  const subTotalHargaJual = keranjangProyek.data.reduce(
    (total, currentValue) => {
      return total + currentValue.jumlah * currentValue.harga;
    },
    0
  );
  const subTotalKustomJual = keranjangProyek.data.reduce(
    (total, currentValue) => {
      return (
        total +
        currentValue.jumlah * (currentValue.hargakustom ?? currentValue.harga)
      );
    },
    0
  );
  const subTotalHargaInstalasi = keranjangProyekInstalasi.data.reduce(
    (total, currentValue) => {
      return total + currentValue.jumlah * currentValue.harga;
    },
    0
  );
  const subTotalKustomInstalasi = keranjangProyekInstalasi.data.reduce(
    (total, currentValue) => {
      return (
        total +
        currentValue.jumlah * (currentValue.hargakustom ?? currentValue.harga)
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
  const provit = hargaDiskon - totalModal;
  const persenProvit = (provit / totalModal) * 100;

  const formatTable = {
    wrapper: "py-0 px-1",
    td: "text-xs py-0 align-top", // Reduce font size and vertical padding
  };
  return (
    <div>
      <div className="flex flex-row gap-2">
        {/* detail  */}
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
                  selectedProyek.id_penawaran,
                  new Date(selectedProyek.tanggal_penawaran)
                )}{" "}
              </div>
              <div>: {selectedProyek.namaperusahaan} </div>
              <div>: {selectedProyek.nama} </div>
              <div>
                : {getDateFId(new Date(selectedProyek.tanggal_penawaran))}{" "}
              </div>
              <div>: {selectedProyek.klien} </div>
              <div>: {selectedProyek.instansi} </div>
              <div>: {selectedProyek.kota} </div>
              <div>: {selectedProyek.namakaryawan} </div>
              <div>
                :{" "}
                {selectedProyek.versi == -1 ? (
                  <span className="bg-red-600 text-white p-1 rounded-sm font-bold">
                    REJECT
                  </span>
                ) : selectedProyek.versi == selectedVersion ? (
                  <span className="bg-green-400 text-white p-1 rounded-sm font-bold">
                    DEAL
                  </span>
                ) : (
                  "penawaran"
                )}
              </div>
            </div>
          </div>
        </div>
        {/* alat */}
        {selectedProyek.versi == 0 ? (
          <div className="bg-white rounded-lg p-3 flex flex-col gap-2">
            <div>Alat</div>
            <Form onSubmit={terapkanButtonPress}>
              <Input
                label="Persen Provit"
                type="text"
                placeholder="Masukkan persen provit"
                value={inputPersenProvit}
                onValueChange={setInputPersenProvit}
              />
              <div>
                <Button type="submit" color="primary">
                  Terapkan
                </Button>
              </div>
            </Form>
          </div>
        ) : (
          <></>
        )}
        {/* rekapitulasi */}
        <ConditionalComponent
          condition={selectVersi.size}
          component={
            <>
              {/* rekapitulasi */}
              <div className="bg-white rounded-lg p-3 w- text-nowrap">
                <div>Rekapitulasi</div>
                <div className="flex gap-2">
                  <div className="basis-">
                    <div>Sub Total Modal</div>
                    <div>Sub Total Harga</div>
                    <div>Maks Diskon</div>
                    <div>Diskon</div>
                    <div>Harga Setelah Diskon</div>
                    <div>Pajak ({selectedRekapitulasiProyek?.pajak}%)</div>
                    <div>Harga Setelah Pajak</div>
                    <div>Estimasi Provit</div>
                  </div>
                  <div className="basis- text-right">
                    <div>
                      <Harga harga={totalModal} />
                    </div>
                    <div>
                      <Harga harga={totalHarga} />
                    </div>
                    <div>
                      ({maksDiskonPersen.toFixed(2)}%){" "}
                      <Harga label={``} harga={maksDiskon} />
                    </div>
                    <div>
                      ({diskonPersen.toFixed(2)}%){" "}
                      <Harga harga={rekapDiskon} endContent={``} />
                    </div>
                    <div>
                      <Harga harga={hargaDiskon} />
                    </div>
                    <div>
                      <Harga harga={pajak} />
                    </div>
                    <div>
                      <Harga harga={finalHarga} />
                    </div>
                    <div>
                      ({persenProvit.toFixed(2)}%) <Harga harga={provit} />
                    </div>
                    <ConditionalComponent
                      condition={selectedProyek.versi == 0}
                      component={
                        <Button
                          onPress={handleButtonEdit}
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
            </>
          }
        />
        {/* tabel keterangan penawaran */}
        <div>
          <KeteranganPenawaran
            keteranganPenawaran={keteranganPenawaran.data}
            idProyek={selectedProyek.id}
          />
        </div>
      </div>
      {/* keranjang penawaran */}
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
                  onPress={modal.penawaran.onOpen}
                  color="primary"
                  className="mt-3"
                >
                  Penawaran
                </Button>
              </div>
              {["admin", "super"].includes(user?.peran) ? (
                selectedProyek.versi <= 0 ? (
                  <div>
                    <Button
                      onPress={handleButtonSetAsDealClick}
                      color="primary"
                      className="mt-3"
                    >
                      Set as Deal
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Button
                      onPress={handleButtonCancelDealClick}
                      color="primary"
                      className="mt-3"
                    >
                      Cancel Deal
                    </Button>
                  </div>
                )
              ) : (
                <></>
              )}
              {["admin", "super"].includes(user?.peran) ? (
                selectedProyek.versi != -1 ? (
                  <div>
                    <Button
                      onPress={handleButtonSetAsRejectClick}
                      color="primary"
                      className="mt-3"
                    >
                      Set as Reject
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Button
                      onPress={handleButtonCancelRejectClick}
                      color="primary"
                      className="mt-3"
                    >
                      Cancel Reject
                    </Button>
                  </div>
                )
              ) : (
                <></>
              )}
              <div>
                <Button
                  onPress={modal.invoice.onOpen}
                  color="primary"
                  className="mt-3"
                >
                  Invoice
                </Button>
              </div>
              <NavLinkNewTab
                href={`/proyek/detail/proses?id=${selectedProyek.id}`}
              >
                {"Pengeluaran Proyek ==>>"}
              </NavLinkNewTab>
            </div>
            <div className="-w-11/12">
              {/* sub proyek */}
              <SubProyek id={id} selectedProyek={selectedProyek} />
              {/* tabel produk */}
              <Table
                isStriped
                isCompact
                className="pt-3"
                topContent={
                  <>
                    <div>Produk</div>
                    <ConditionalComponent
                      condition={selectedProyek.versi == 0}
                      component={
                        <div className="flex flex-col gap-2">
                          <TambahProduk
                            form={form}
                            setForm={setForm}
                            disableStok
                            disableVendor
                            customInput={
                              <>
                                <NumberInput
                                  hideStepper
                                  isWheelDisabled
                                  formatOptions={{
                                    useGrouping: false,
                                  }}
                                  className="w-3/12"
                                  value={form.harga - form.hargamodal || ""}
                                  label={"Provit"}
                                  placeholder="Masukkan provit!"
                                  onValueChange={(v) => {
                                    setForm({
                                      ...form,
                                      harga: form.hargamodal + v || "",
                                    });
                                  }}
                                />
                                <NumberInput
                                  hideStepper
                                  isWheelDisabled
                                  formatOptions={{
                                    useGrouping: false,
                                  }}
                                  className="w-3/12"
                                  value={
                                    Math.round(
                                      countPercentProvit(
                                        form.hargamodal,
                                        form.harga
                                      ) * 100
                                    ) / 100 || ""
                                  }
                                  label={"Provit (%)"}
                                  placeholder="Masukkan provit %!"
                                  onValueChange={(v) => {
                                    setForm({
                                      ...form,
                                      harga:
                                        Math.round(
                                          countPriceByPercentProfit(
                                            form.hargamodal,
                                            v
                                          )
                                        ) || "",
                                    });
                                  }}
                                />
                                <Select
                                  label="Sub Proyek"
                                  placeholder="Pilih subproyek! (Opsional)"
                                  className="w-3/12"
                                  selectedKeys={form.selectSubProyek}
                                  onSelectionChange={(v) => {
                                    setForm({
                                      ...form,
                                      selectSubProyek: v,
                                    });
                                  }}
                                >
                                  {subProyek.data.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                      {item.nama}
                                    </SelectItem>
                                  ))}
                                </Select>
                              </>
                            }
                          />
                          <div>
                            <Button
                              onPress={() => {
                                tambahButtonPress(form, setForm);
                              }}
                              color="primary"
                            >
                              Tambah
                            </Button>
                          </div>
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
                                currentValue.jumlah *
                                  currentValue.temphargamodal
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
                                  (currentValue.harga -
                                    currentValue.temphargamodal)
                              );
                            },
                            0
                          )}
                        />
                      </div>
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
                <TableBody items={keranjangProduk}>
                  {(item) => (
                    <TableRow key={item.id_keranjangproyek}>
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
                isStriped
                isCompact
                topContent={
                  <>
                    <div>Instalasi</div>
                    <ConditionalComponent
                      condition={selectedProyek.versi == 0}
                      component={
                        <div className="flex flex-col gap-2">
                          <TambahProduk
                            form={formInstalasi}
                            setForm={setFormInstalasi}
                            disableStok
                            disableVendor
                            customInput={
                              <>
                                <NumberInput
                                  hideStepper
                                  isWheelDisabled
                                  formatOptions={{
                                    useGrouping: false,
                                  }}
                                  className="w-3/12"
                                  value={
                                    formInstalasi.harga -
                                      formInstalasi.hargamodal || ""
                                  }
                                  label={"Provit"}
                                  placeholder="Masukkan provit!"
                                  onValueChange={(v) => {
                                    setFormInstalasi({
                                      ...formInstalasi,
                                      harga: formInstalasi.hargamodal + v || "",
                                    });
                                  }}
                                />
                                <NumberInput
                                  hideStepper
                                  isWheelDisabled
                                  formatOptions={{
                                    useGrouping: false,
                                  }}
                                  className="w-3/12"
                                  value={
                                    Math.round(
                                      countPercentProvit(
                                        formInstalasi.hargamodal,
                                        formInstalasi.harga
                                      ) * 100
                                    ) / 100 || ""
                                  }
                                  label={"Provit (%)"}
                                  placeholder="Masukkan provit %!"
                                  onValueChange={(v) => {
                                    setFormInstalasi({
                                      ...formInstalasi,
                                      harga:
                                        Math.round(
                                          countPriceByPercentProfit(
                                            formInstalasi.hargamodal,
                                            v
                                          )
                                        ) || "",
                                    });
                                  }}
                                />
                                <Input
                                  type="text"
                                  value={formInstalasi.keterangan}
                                  label="Nama Kustom"
                                  // placeholder="Masukkan jumlah!"
                                  className="w-3/12"
                                  endContent={
                                    <div className="pointer-events-none flex items-center">
                                      <span className="text-default-400 text-small"></span>
                                    </div>
                                  }
                                  onValueChange={(v) =>
                                    setFormInstalasi({
                                      ...formInstalasi,
                                      keterangan: v,
                                    })
                                  }
                                />
                                <Select
                                  label="Sub Proyek"
                                  placeholder="Pilih subproyek! (Opsional)"
                                  className="w-3/12"
                                  selectedKeys={formInstalasi.selectSubProyek}
                                  onSelectionChange={(v) => {
                                    setFormInstalasi({
                                      ...formInstalasi,
                                      selectSubProyek: v,
                                    });
                                  }}
                                >
                                  {subProyek.data.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                      {item.nama}
                                    </SelectItem>
                                  ))}
                                </Select>
                              </>
                            }
                          />
                          <div>
                            <Button
                              onPress={() => {
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
                                currentValue.jumlah *
                                  currentValue.temphargamodal
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
                                  (currentValue.harga -
                                    currentValue.temphargamodal)
                              );
                            },
                            0
                          )}
                        />
                      </div>
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
                <TableBody items={keranjangIntalasi}>
                  {(item) => (
                    <TableRow key={item.id_keranjangproyek}>
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
                  isInvalid={
                    formRekapitulasi.diskon > maksDiskon ? true : false
                  }
                  errorMessage={
                    formRekapitulasi.diskon > maksDiskon
                      ? "Diskon melebihi batas"
                      : undefined
                  }
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
                <Select
                  label="Sub Proyek"
                  placeholder="Pilih subproyek! (Opsional)"
                  selectedKeys={form.selectSubProyek}
                  onSelectionChange={(v) => {
                    setForm({
                      ...form,
                      selectSubProyek: v,
                    });
                  }}
                >
                  {subProyek.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <div>Nama : {form.nama}</div>
                {form.instalasi ? (
                  <Input
                    type="text"
                    label="Nama Kustom (Opsional)"
                    placeholder="Masukkan nama kustom!"
                    value={form.keterangan}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        keterangan: v,
                      })
                    }
                  />
                ) : (
                  <></>
                )}

                <div>Merek : {form.nmerek}</div>
                <div>Tipe : {form.tipe}</div>
                <div>Vendor : {form.nvendor}</div>
                <div>Satuan : {form.satuan}</div>
                <div>Stok : {form.stok}</div>
                <NumberInput
                  hideStepper
                  isWheelDisabled
                  formatOptions={{
                    useGrouping: false,
                  }}
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
                <NumberInput
                  hideStepper
                  isWheelDisabled
                  formatOptions={{
                    useGrouping: false,
                  }}
                  value={form.temphargamodal}
                  label={
                    <>
                      Harga Modal (Ref: <Harga harga={form.oldHargaModal} />)
                    </>
                  }
                  placeholder="Masukkan harga!"
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      temphargamodal: v,
                    })
                  }
                />
                {/* <InputProvitMargin form={form} setForm={setForm} /> */}
                <NumberInput
                  hideStepper
                  isWheelDisabled
                  formatOptions={{
                    useGrouping: false,
                  }}
                  value={form.harga}
                  // label={`Harga Jual (Ref: ${form.refHarga})`}
                  label={
                    <>
                      Harga Jual (Ref: <Harga harga={+form.oldHarga} />)
                    </>
                  }
                  placeholder="Masukkan harga!"
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      harga: v,
                    })
                  }
                />
                <NumberInput
                  hideStepper
                  isWheelDisabled
                  formatOptions={{
                    useGrouping: false,
                  }}
                  value={form.harga - form.temphargamodal || ""}
                  // label={`Harga Jual (Ref: ${form.refHarga})`}
                  label={
                    <>
                      Provit
                      {/* (Ref: <Harga harga={+form.oldHarga} />) */}
                    </>
                  }
                  placeholder="Masukkan harga!"
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      harga: +form.temphargamodal + +v,
                    })
                  }
                />
                <NumberInput
                  hideStepper
                  isWheelDisabled
                  formatOptions={{
                    useGrouping: false,
                  }}
                  value={
                    Math.round(
                      countPercentProvit(
                        form.temphargamodal || 0,
                        form.harga || 0
                      ) * 100
                    ) / 100 || ""
                  }
                  // label={`Harga Jual (Ref: ${form.refHarga})`}
                  label={
                    <>
                      Persen Provit (%)
                      {/* (Ref: <Harga harga={+form.oldHarga} />) */}
                    </>
                  }
                  placeholder="Masukkan persen provit!"
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      harga: Math.round(form.temphargamodal * (1 + v / 100)),
                    })
                  }
                />
                <div>
                  Total Harga Modal :{" "}
                  <Harga harga={form.temphargamodal * form.jumlah} />
                </div>
                <div>
                  Total Harga Jual : <Harga harga={form.harga * form.jumlah} />
                </div>
                <div>
                  Total Profit :{" "}
                  <Harga
                    harga={(form.harga - form.temphargamodal) * form.jumlah}
                  />
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
                  className="bg-white text-black overflow-x-hidden"
                >
                  {/* {Logo} */}
                  <div className="flex flex-row items-center">
                    {selectedProyek.id_perusahaan == 1 ? (
                      <>
                        <Image src={logoBks} alt="Company Logo" width={40} />
                        <div className="flex flex-col pl-2 text-xs">
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
                        <Image src={logoSvt} alt="Company Logo" width={40} />
                        <div className="flex flex-col pl-2 text-xs">
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
                  <Divider className="bg-sky-500 my-1 py-1" />
                  {/* <hr className="my-3 bg-sky-500 h-5" /> */}
                  <div className="pt-1 text-xs">
                    <div className="flex">
                      <div className="w-1/2">
                        <div>Kepada Yth,</div>
                        <div>{selectedProyek.klien}</div>
                        <div>{selectedProyek.instansi}</div>
                        <div>{selectedProyek.kota}</div>
                      </div>
                      <div className="w-1/2 text-right">
                        <div>
                          Yogyakarta,{" "}
                          {getDateFId(
                            new Date(selectedProyek.tanggal_penawaran)
                          )}
                        </div>
                        <div>
                          No :{" "}
                          {penawaran(
                            selectedProyek.id_penawaran,
                            new Date(selectedProyek.tanggal_penawaran),
                            selectedProyek.id_karyawan
                          )}
                          {/* /{selectedVersion} */}
                        </div>
                      </div>
                    </div>
                    <div className="pt-1">Dengan Hormat,</div>
                    <div>
                      Sehubungan dengan adanya permintaan Bapak/Ibu, bersama ini
                      kami sampaikan penawaran harga/RAB di{" "}
                      {selectedProyek.instansi} {selectedProyek.kota}
                    </div>
                  </div>
                  {/* produk */}
                  {dataPenawaran.length > 0 ? (
                    <Table
                      isStriped
                      topContentPlacement="outside"
                      className="border text-xs py-0 my-0"
                      classNames={formatTable}
                      aria-label="Example table with custom cells"
                      shadow="none"
                      topContent={<div className="py-0 my-0">Produk</div>}
                      bottomContent={
                        <>
                          <div className="text-right">
                            Sub Total Harga :{" "}
                            {subTotalKustomJual.toLocaleString("id-ID")}
                          </div>
                        </>
                      }
                    >
                      <TableHeader
                        className="my-0 py-0"
                        columns={col.penawaran}
                      >
                        {(column) => (
                          <TableColumn className="py-0 my-0" key={column.key}>
                            {column.label}
                          </TableColumn>
                        )}
                      </TableHeader>
                      <TableBody items={result}>
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
                  ) : (
                    <></>
                  )}
                  {/* instalasi */}
                  {dataInstalasi.length > 0 ? (
                    <Table
                      isStriped
                      radius="none"
                      topContentPlacement="outside"
                      className="mt-0 border text-xs my-0 py-0"
                      classNames={formatTable}
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
                      <TableBody items={resultInstalasi}>
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
                  ) : (
                    <></>
                  )}
                  {/* Rekapitulasi */}
                  <div className="mt-0 border no-break text-xs">
                    <div className="px-3">
                      {/* <div>Rekapitulasi</div> */}
                      <div className="flex">
                        <div className="basis-3/6">Rekapitulasi</div>
                        <div className="basis-2/6">
                          <div>Produk</div>
                          <div>Instalasi</div>
                          {rekapDiskon + rekapPajak > 0 ? (
                            <div>Sub Total</div>
                          ) : (
                            <></>
                          )}
                          {rekapDiskon > 0 ? (
                            <>
                              <div>Diskon</div>
                              {rekapPajak > 0 ? (
                                <div>Harga Setelah Diskon</div>
                              ) : (
                                <></>
                              )}
                            </>
                          ) : (
                            <></>
                          )}
                          {rekapPajak > 0 ? (
                            <>
                              <div>Pajak ({rekapPajak}%)</div>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                        <div className="basis-1/6 text-right">
                          <div>
                            <Harga harga={subTotalKustomJual} />
                          </div>
                          <div>
                            <Harga harga={subTotalKustomInstalasi} />
                          </div>
                          {rekapDiskon + rekapPajak > 0 ? (
                            <div>
                              <Harga harga={totalKustom} />
                            </div>
                          ) : (
                            <></>
                          )}
                          {rekapDiskon > 0 ? (
                            <>
                              <div>{<Harga harga={rekapDiskon} />}</div>
                              {rekapPajak ? (
                                <div>{<Harga harga={kustomDiskon} />}</div>
                              ) : (
                                <></>
                              )}
                            </>
                          ) : (
                            <></>
                          )}
                          {rekapPajak > 0 ? (
                            <>
                              <div>{<Harga harga={pajakKustom} />}</div>
                              {/* <div>
                                <Harga harga={finalKustom} />
                              </div> */}
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end text-sm font-semibold leading-3 pb-1">
                      <div className="basis-2/6 text-left">Total Harga</div>
                      <div className="px-1 basis-1/6 text-right">
                        <Harga harga={finalKustom} />
                      </div>
                    </div>
                  </div>
                  {/* keterangan */}
                  <div className="flex flex-col mt-3 text-xs">
                    <div className="no-break pb-1">
                      Keterangan <br />
                      {dataInstalasi.length < 1 ? (
                        <>
                          - Harga belum termasuk instalasi pemasangan. <br />
                        </>
                      ) : (
                        ""
                      )}
                      - Harga {keteranganPajak} termasuk pajak-pajak. <br />
                      - Syarat pembayaran sesuai dengan kesepakatan kedua belah
                      pihak. <br />
                      - Waktu penyerahan barang sesuai jadwal yang disepakati
                      bersama. <br />- Harga tidak terikat dan dapat berubah
                      sewaktu-waktu.
                      {keteranganPenawaran.data.map((v) => {
                        if (v.id_proyek)
                          return <div key={v.id}>- {v.keterangan}</div>;
                      })}
                    </div>
                    <div className="no-break">
                      <div>
                        Demikian penawaran ini kami ajukan, sambil menantikan
                        pesanan Bapak/Ibu, kami ucapkan terima kasih.
                      </div>
                      <div className="pt-1">Hormat kami,</div>
                      <div>{proyek.data[0].namakaryawan}</div>
                      <div className="pt-1">
                        # Penawaran ini dikeluarkan secara otomatis oleh sistem
                        sehingga tidak memerlukan tanda-tangan.
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Tutup
                </Button>
                <Button onPress={handlePrintPenawaran} color="primary">
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
                <div
                  ref={componentRef.invoice}
                  className="bg-white text-black leading-none"
                >
                  <div className="flex flex-row items-center">
                    {/* <Image
                      src={logo}
                      alt="Company Logo"
                      width={70}
                      // height={500} automatically provided
                      // blurDataURL="data:..." automatically provided
                      // placeholder="blur" // Optional blur-up while loading
                    /> */}
                    <div className="flex flex-col">
                      {selectedProyek.namaperusahaan == "bks" ? (
                        <BKSHeader />
                      ) : (
                        <SVTHeader />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row items-center">
                    <div className="basis-1/2 bg-sky-500 h-2"></div>
                    <div className="basis-1/4 text-2xl font-bold text-center inline-block align-middle items-center">
                      Invoice
                    </div>
                    <div className="basis-1/4 bg-sky-500 h-2"></div>
                  </div>
                  <div className="flex flex-row">
                    <div className="basis-1/2">
                      <div>Invoice kepada :</div>
                      <div>{selectedProyek.klien}</div>
                      <div>{selectedProyek.instansi}</div>
                    </div>
                    <div className="basis-1/2 text-end">
                      <div>
                        Id :{" "}
                        {invoice(
                          selectedProyek.id_penawaran,
                          new Date(selectedProyek.tanggal_penawaran)
                        )}
                      </div>
                      <div>
                        Tanggal :{" "}
                        {getDateFId(new Date(selectedProyek.tanggal_penawaran))}
                      </div>
                    </div>
                  </div>
                  <Table
                    className="mt-3 border"
                    aria-label="Example table with custom cells"
                    shadow="none"
                    isCompact
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
                    <TableBody items={invoiceData}>
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
                    <div className="basis-2/4"></div>
                    <div className="basis-2/4 pl-3">
                      <div className="flex">
                        <div className="basis-1/2">
                          <div>
                            {rekapDiskon + rekapPajak > 0
                              ? "Sub Total"
                              : "Total"}
                          </div>
                          {rekapDiskon > 0 ? (
                            <>
                              <div>Diskon</div>
                              <div>Harga Setelah Diskon</div>
                            </>
                          ) : (
                            <></>
                          )}
                          {rekapPajak > 0 ? (
                            <>
                              <div>Pajak ({rekapPajak}%)</div>
                              <div>Harga Setelah Pajak</div>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                        <div className="text-right basis-1/2">
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
                          {rekapPajak > 0 ? (
                            <>
                              <div>{<Harga harga={pajakKustom} />}</div>
                              <div>
                                <Harga harga={finalKustom} />
                              </div>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button onPress={handlePrintInvoice} color="primary">
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

const SubProyek = ({ id, selectedProyek }) => {
  const [form, setForm] = useState({});
  const modal = useDisclosure();

  const subProyek = useClientFetch(`subproyek?id_proyek=${id}`);

  const tambahSubProyekButtonPress = async () => {
    if (!form.namaSubProyek) return alert("Silahkan masukkan nama sub proyek!");
    const res = await fetch(`${api_path}subproyek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id_proyek: id,
        nama: form.namaSubProyek,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    setForm({ ...form, namaSubProyek: "" });
    // console.log(json.message);
    // return alert(json.message);
  };
  const editButtonPress = (data, onOpen) => {
    setForm(data);
    modal.onOpen();
  };
  const simpanButtonPress = async (data, onClose) => {
    const res = await fetch(`${api_path}subproyek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    onClose();
    // console.log(json.message);
    //return alert(json.message);
  };
  const deleteButtonPress = async (data) => {
    if (confirm(`Hapus sub proyek ${data.nama}?`)) {
      const res = await fetch(`${api_path}subproyek`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id: data.id }),
      });
      const json = await res.json();
      if (res.status == 400)
        return alert(
          `Gagal menghapus. Sub proyek masih terikat pada tabel produk atau instalasi. ` +
            json.message
        );
      return;
      // return alert(json.message);
    }
  };

  if (subProyek.error) return <div>failed to load</div>;
  if (subProyek.isLoading) return <div>loading...</div>;
  return (
    <div className="bg-white rounded-lg flex flex-col gap-2 mt-2 p-3">
      <div>Sub Proyek</div>
      {selectedProyek.versi == 0 ? (
        <div className="flex gap-2">
          <Input
            type="text"
            value={form.namaSubProyek}
            label="Nama"
            placeholder="Masukkan nama Sub Proyek!"
            className="w-3/12"
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small"></span>
              </div>
            }
            onValueChange={(v) =>
              setForm({
                ...form,
                namaSubProyek: v,
              })
            }
          />
          <div>
            <Button
              onPress={() => {
                tambahSubProyekButtonPress();
              }}
              color="primary"
            >
              Tambah
            </Button>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="flex gap-2">
        {subProyek.data.map((data, i) => (
          <Chip
            key={i}
            // onClose={() => handleClose(sP)}
            variant="flat"
            endContent={
              selectedProyek.versi == 0 ? (
                <div className="flex gap-2">
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
              ) : (
                <></>
              )
            }
          >
            {data.nama}
          </Chip>
        ))}
      </div>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.isOpen}
        onOpenChange={modal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Sub Proyek
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  value={form.nama}
                  label="Nama Sub Proyek"
                  placeholder="Masukkan nama sub proyek!"
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      nama: v,
                    })
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    setForm({ nama: "" });
                    onClose();
                  }}
                >
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
};

const InputProvit = ({ classNames, form, setForm, defPersenProvit }) => {
  const [persenProvit, setPersenProvit] = useState(defPersenProvit);
  const terapkanButtonRef = useRef(null);
  // const persenProvit =
  //   Math.ceil(countPercentProvit(form.hargamodal || 0, form.harga) * 100) / 100;
  return (
    <NumberInput
      hideStepper
      isWheelDisabled
      formatOptions={{
        useGrouping: false,
      }}
      value={persenProvit}
      label={"Provit (%)"}
      placeholder="Masukkan provit!"
      className={classNames || ""}
      endContent={
        <Button
          ref={terapkanButtonRef}
          color="primary"
          size="sm"
          onPress={() => {
            setForm({
              ...form,
              harga: Math.ceil(
                (form.hargamodal || 0) * (1 + (persenProvit || 0) / 100)
              ),
            });
          }}
        >
          Terapkan
        </Button>
      }
      onKeyDown={(e) => {
        if (e.key == "Enter") {
          e.preventDefault();
          terapkanButtonRef.current?.click();
        }
      }}
      onValueChange={(v) => {
        ``;
        // setForm({
        //   ...form,
        //   harga: Math.ceil((form.hargamodal || 0) * (1 + v / 100)),
        // });
        setPersenProvit(v);
      }}
    />
  );
};

const InputProvitMargin = ({ classNames, form, setForm }) => {
  return (
    <Input
      type="number"
      max={99}
      value={
        form.provitmarginpersen || 0
        /* Math.round(
          ((form.harga -
            (form.temphargamodal ? form.temphargamodal : form.hargamodal)) /
            form.harga) *
            100 *
            100
        ) / 100 || 0 */
      }
      label={"Provit Margin (%)"}
      placeholder="Masukkan provit margin persen!"
      className={classNames ?? ""}
      onValueChange={(v) =>
        setForm({
          ...form,
          harga: Math.ceil(
            (form.temphargamodal || form.hargamodal || 0) / (1 - v / 100)
          ),
          provitmarginpersen: Math.ceil(v * 100) / 100 || "",
        })
      }
    />
  );
};

const KeteranganPenawaran = ({ keteranganPenawaran, idProyek }) => {
  const [form, setForm] = useState();

  const simpanButtonPress = async (data, onClose) => {
    // if (data.jumlah <= 0) return alert("Jumlah belum diisi");
    if (!data.keterangan) return alert("Keterangan belum diisi.");
    const res = await fetch(`${api_path}keteranganpenawaran`, {
      method: data.mode == "Tambah" ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...data,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    onClose();
    // console.log(json.message);
    //return alert(json.message);
  };

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "status":
        const isChecked = !!data.id_proyek;
        return (
          <Checkbox
            isSelected={isChecked}
            onValueChange={async (v) => {
              if (v === isChecked) return;
              const res = await fetch(`${api_path}proyek_keteranganpenawaran`, {
                method: v ? "POST" : "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify({
                  idProyek,
                  idKeteranganPenawaran: data.id,
                }),
              });
              const json = await res.json();
              // if (res.status == 400) console.log(json.message);
              // if (res.status == 400) return alert(json.message);
              // console.log(json.message);
              //return alert(json.message);
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }}
          ></Checkbox>
        );
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit">
              <span
                onClick={() => {
                  setForm({
                    ...form,
                    mode: "Edit",
                    id: data.id,
                    keterangan: data.keterangan,
                  });
                  onOpen();
                }}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete">
              <span
                onClick={async () => {
                  if (confirm("Hapus keterangan?")) {
                    console.log(data.id);
                    const res = await fetch(`${api_path}keteranganpenawaran`, {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                      },
                      body: JSON.stringify({ id: data.id }),
                    });
                    const json = await res.json();
                    if (res.status == 400) return alert(json.message);
                    return;
                    // return alert(json.message);
                  }
                }}
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

  const cols = [
    {
      key: "keterangan",
      label: "Keterangan",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];

  return (
    <>
      <Table
        isStriped
        isCompact
        className=""
        topContent={
          <div>
            <Button
              color="primary"
              onPress={() => {
                setForm({ ...form, mode: "Tambah" });
                onOpen();
              }}
            >
              Tambah
            </Button>
          </div>
        }
        // bottomContent={}
        aria-label="Example table with custom cells"
      >
        <TableHeader columns={cols}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={keteranganPenawaran}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.mode} Keterangan
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Keterangan"
                  placeholder="Masukkan keterangan!"
                  value={form.keterangan}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      keterangan: v,
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
    </>
  );
};
