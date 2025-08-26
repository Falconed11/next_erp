"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
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
  Switch,
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
import { Select, SelectItem } from "@heroui/react";
import { CheckboxGroup, Checkbox } from "@heroui/react";
import { Form } from "@heroui/form";
import Image from "next/image";
import logoBks from "@/public/logo-bks.jpeg";
import logoSvt from "@/public/logo-svt.jpeg";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  countPercentProvit,
  countPriceByPercentProfit,
  countProvitMarginPercent,
  countRecapitulation,
} from "@/app/utils/formula";
import { updateSwitch } from "@/app/utils/tools";
import Kwitansi from "./kwitansi";
import Invoice from "./invoice";
import KeteranganPenawaran from "./keteranganpenawaran";
import Rekapitulasi from "./rekapitulasi";
import SubProyek from "./subproyek";
import {
  createRecapTable,
  createRecapTableTotal,
  createTable,
  RecapTable,
} from "./rekap";

const api_path = getApiPath();

export default function App({ id, versi }) {
  const session = useSession();
  const user = session.data?.user;
  const router = useRouter();
  const componentRef = {
    penawaran: useRef(null),
  };
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
  const keteranganPenawaran = useClientFetch(
    `keteranganpenawaran?idProyek=${id}`
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
  const PERSEN_PROVIT = 30;
  const [inputPersenProvit, setInputPersenProvit] = useState(PERSEN_PROVIT);

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
    else setForm({ selectProduk: "", jumlah: "", harga: "", keterangan: "" });
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
  const handleButtonEditJenisProyek = () => {
    setSelected(kategoriProyek);
    modal.jenisproyek.onOpen();
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
      const isChecked = (v) => {
        return !!v;
      };
      const showMerek = isChecked(data.showmerek);
      const showTipe = isChecked(data.showtipe);
      switch (columnKey) {
        case "nama":
          return `${data.nama}${data.keterangan ? `(${data.keterangan})` : ""}`;
          data.keterangan ? `${data.nama} (${data.keterangan})` : data.nama;
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
        case "showmerek":
          return (
            <Switch
              size="sm"
              isSelected={showMerek}
              onValueChange={async (v) => {
                await updateSwitch(
                  v,
                  showMerek,
                  "keranjangproyek",
                  "PUT",
                  {
                    id: data.id_keranjangproyek,
                    showmerek: v ? 1 : 0,
                  },
                  [keranjangProyek, keranjangProyekInstalasi]
                );
              }}
            ></Switch>
          );
        case "showtipe":
          return (
            <Switch
              size="sm"
              isSelected={showTipe}
              onValueChange={async (v) => {
                await updateSwitch(
                  v,
                  showTipe,
                  "keranjangproyek",
                  "PUT",
                  {
                    id: data.id_keranjangproyek,
                    showtipe: v ? 1 : 0,
                  },
                  [keranjangProyek, keranjangProyekInstalasi]
                );
              }}
            ></Switch>
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
          return cellValue == "NN" || !data.showmerek ? "" : cellValue;
        case "tipe":
          return cellValue == "NN" || !data.showtipe
            ? ""
            : removePrefixIfMatchIgnoreCase(new String(cellValue), "svt-");
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
  };
  const modal = {
    produk: useDisclosure(),
    penawaran: useDisclosure(),
    invoice: useDisclosure(),
    jenisproyek: useDisclosure(),
  };
  const dataPenawaran = useMemo(() => {
    if (!keranjangProyek?.data) return [];
    return [...keranjangProyek.data]
      .sort((a, b) => a.subproyek?.localeCompare(b?.subproyek))
      .map((produk, i) => ({
        ...produk,
        no: i + 1,
      }));
  }, [keranjangProyek?.data]);

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
  const dataInstalasi = useMemo(() => {
    if (!keranjangProyekInstalasi?.data) return [];
    return [...keranjangProyekInstalasi.data]
      .sort((a, b) => a.subproyek?.localeCompare(b?.subproyek))
      .map((produk, i) => ({
        ...produk,
        no: i + 1,
      }));
  }, [keranjangProyekInstalasi?.data]);

  const resultInstalasi = [];
  let currentGroupInstalasi = null;

  dataInstalasi?.forEach((item) => {
    if (item.subproyek !== currentGroupInstalasi) {
      currentGroupInstalasi = item.subproyek;
      resultInstalasi.push({ no: uuidv4(), nama: item.subproyek });
    }
    resultInstalasi.push(item);
  });

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

  const keranjangProduk = keranjangProyek.data;
  const keranjangInstalasi = keranjangProyekInstalasi.data;
  const rekapitulasi = rekapitulasiProyek.data[0] || {
    id_proyek: id,
    versi,
    diskon: 0,
    diskoninstalasi: 0,
    pajak: 0,
  };

  const selectedProyek = proyek.data[0];

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
        key: "showmerek",
        label: "",
      },
      {
        key: "tipe",
        label: "Tipe",
      },
      {
        key: "showtipe",
        label: "",
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
        key: "showmerek",
        label: "",
      },
      {
        key: "tipe",
        label: "Tipe",
      },
      {
        key: "showtipe",
        label: "",
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
  const rekapPajak = selectedRekapitulasiProyek?.pajak || 0;
  const keteranganPajak = rekapPajak ? "sudah" : "tidak";
  const subTotalHargaJual = keranjangProyek.data.reduce(
    (total, currentValue) => {
      return total + currentValue.jumlah * currentValue.harga;
    },
    0
  );
  const subTotalHargaInstalasi = keranjangProyekInstalasi.data.reduce(
    (total, currentValue) => {
      return total + currentValue.jumlah * currentValue.harga;
    },
    0
  );
  const selectedVersion = selectVersi.values().next().value;
  const formatTable = {
    wrapper: "py-0 px-1",
    td: "text-xs py-0 align-top", // Reduce font size and vertical padding
  };
  const { rekapitulasiPeralatan, rekapitulasiInstalasi, rekapitulasiTotal } =
    countRecapitulation(keranjangProduk, keranjangInstalasi, rekapitulasi);
  const dataTabelPeralatan = (isPenawaran) =>
    createRecapTable(
      rekapitulasiPeralatan,
      rekapitulasi.diskon,
      rekapitulasi.pajak,
      0,
      isPenawaran
    );
  const dataTabelInstalasi = (isPenawaran) =>
    createRecapTable(
      rekapitulasiInstalasi,
      rekapitulasi.diskoninstalasi,
      0,
      0,
      isPenawaran
    );
  const dataTabelTotal = (isPenawaran) =>
    createRecapTableTotal(rekapitulasiTotal, isPenawaran);
  const tabelPeralatan = dataTabelPeralatan(false);
  const tabelInstalasi = dataTabelInstalasi(false);
  const tabelTotal = dataTabelTotal(false);
  const compRekapPeralatan = (
    <TableBottom tableData={dataTabelPeralatan(true)} />
  );
  const compRekapInstalasi = (
    <TableBottom tableData={dataTabelInstalasi(true)} />
  );
  const compRekapTotal = (
    <TableBottom tableData={dataTabelTotal(true)} title="Rekapitulasi" />
  );
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
              <NumberInput
                hideStepper
                isWheelDisabled
                formatOptions={{
                  useGrouping: false,
                }}
                label="Persen Provit"
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
        <Rekapitulasi
          peralatan={tabelPeralatan}
          instalasi={tabelInstalasi}
          total={tabelTotal}
          rekapitulasiPeralatan={rekapitulasiPeralatan}
          rekapitulasiInstalasi={rekapitulasiInstalasi}
          rekapitulasiTotal={rekapitulasiTotal}
          rekapitulasi={rekapitulasi}
          idProyek={id}
          versi={versi}
          selectedProyek={selectedProyek}
        />
        {/* tabel keterangan penawaran */}
        <div>
          <KeteranganPenawaran
            keteranganPenawaran={keteranganPenawaran}
            idProyek={selectedProyek.id}
          />
        </div>
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
              {/* Invoice */}
              <div>
                <Invoice
                  proyek={selectedProyek}
                  className={formatTable}
                  peralatan={keranjangProduk}
                  instalasi={keranjangInstalasi}
                  rekapTotal={rekapitulasiTotal}
                  compRekapPeralatan={compRekapPeralatan}
                  compRekapInstalasi={compRekapInstalasi}
                  compRekapTotal={compRekapTotal}
                />
              </div>
              {/* Kwitansi */}
              <div>
                <Kwitansi
                  proyek={selectedProyek}
                  nilaiProyek={rekapitulasiTotal.hargaPajak}
                />
              </div>
              <NavLinkNewTab
                href={`/proyek/detail/proses?id=${selectedProyek.id}`}
              >
                {"Pengeluaran & Pembayaran ==>>"}
              </NavLinkNewTab>
            </div>
            <div className="-w-11/12">
              {/* sub proyek */}
              <SubProyek id={id} selectedProyek={selectedProyek} />
              {/* tabel peralatan */}
              <Table
                isStriped
                isCompact
                className="pt-3"
                topContent={
                  <>
                    <div>Peralatan</div>
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
                                <Input
                                  type="text"
                                  value={form.keterangan}
                                  label="Nama Kustom"
                                  placeholder="Masukkan nama kustom! (Opsional)"
                                  // placeholder="Masukkan jumlah!"
                                  className="w-3/12"
                                  onValueChange={(v) =>
                                    setForm({
                                      ...form,
                                      keterangan: v,
                                    })
                                  }
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
                                  placeholder="Masukkan nama kustom! (Opsional)"
                                  // placeholder="Masukkan jumlah!"
                                  className="w-3/12"
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
                <TableBody items={keranjangInstalasi}>
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
                Edit {form.instalasi ? "Instalasi" : "Produk"}
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
                  {/* peralatan */}
                  {dataPenawaran.length > 0 ? (
                    <Table
                      isStriped
                      topContentPlacement="outside"
                      className="border text-xs py-0 my-0"
                      classNames={formatTable}
                      aria-label="Example table with custom cells"
                      shadow="none"
                      topContent={<div className="py-0 my-0">Peralatan</div>}
                      bottomContent={compRekapPeralatan}
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
                      bottomContent={compRekapInstalasi}
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
                  {
                    /* Rekapitulasi */
                    <div className="mt-0 border no-break text-xs">
                      {compRekapTotal}
                    </div>
                  }
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
                      {!!rekapPajak && (
                        <>
                          - Harga {keteranganPajak} termasuk pajak-pajak. <br />
                        </>
                      )}
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
    </div>
  );
}

const TableBottom = ({ title = "", tableData }) => (
  <div className="grid grid-cols-2 overscroll-none">
    <div>{title}</div>
    <div>
      <RecapTable tableData={tableData} />
    </div>
  </div>
);
