"use client";
import React, { useState, useRef, useMemo } from "react";
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
  Pagination,
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
import {
  getApiPath,
  useClientFetch,
  useClientFetchNoInterval,
} from "@/app/utils/apiconfig";
import {
  getDate,
  getDateF,
  getDateFId,
  getCurFirstLastDay,
} from "@/app/utils/date";
import Harga from "@/components/harga";
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
import { v4 as uuidv4 } from "uuid";

const api_path = getApiPath();
const [startDate, endDate] = getCurFirstLastDay();

export default function App({ id }) {
  const session = useSession();
  const user = session.data?.user;
  const router = useRouter();
  const componentRef = {
    penawaran: useRef(),
    invoice: useRef(),
  };

  const [nama, setNama] = useState("");
  const [idF, setIdF] = useState("");
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 25;

  const [current, setCurrent] = useState({
    startDate,
    endDate,
  });

  const pengeluaranproyek = useClientFetch(
    `pengeluaranproyek?id_vendor=${id}&starta=${getDate(
      current.startDate
    )}&enda=${getDate(current.endDate)}`
  );
  const [form, setForm] = useState({
    selectProduk: new Set([]),
    selectKategori: new Set([]),
  });

  let data = pengeluaranproyek?.data;
  data = data?.filter(
    (row) =>
      (row.nama.toLowerCase().includes(nama.toLowerCase()) ||
        row.nmerek?.toLowerCase().includes(nama.toLowerCase()) ||
        row.tipe?.toLowerCase().includes(nama.toLowerCase()) ||
        row.vendor?.toLowerCase().includes(nama.toLowerCase())) &&
      row.id_kustom.toLowerCase().includes(idF.toLocaleLowerCase())
  );
  data = data?.slice(0, 50);
  const filteredData = pengeluaranproyek?.data?.filter(
    (row) =>
      (row.nama.toLowerCase().includes(nama.toLowerCase()) ||
        row.nmerek?.toLowerCase().includes(nama.toLowerCase()) ||
        row.tipe?.toLowerCase().includes(nama.toLowerCase()) ||
        row.vendor?.toLowerCase().includes(nama.toLowerCase())) &&
      row.id_kustom.toLowerCase().includes(idF.toLocaleLowerCase())
  );

  const pages = useMemo(() => {
    return filteredData ? Math.ceil(filteredData?.length / rowsPerPage) : 0;
  }, [filteredData?.length, rowsPerPage]);
  const loadingState = pengeluaranproyek.isLoading ? "loading" : "idle";
  const offset = (page - 1) * rowsPerPage;

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
    setForm({ jumlah: "", harga: "" });
    // console.log(json.message);
    // return alert(json.message);
  };
  const editButtonPress = (data) => {
    setForm({
      ...data,
      id: data.id_keranjangproyek,
      profit: data.harga - data.hargamodal,
      refHarga: data.harga,
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
  const simpanButtonPress = async (data, onClose) => {
    const res = await fetch(`${api_path}keranjangproyek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...data,
        id_subproyek: form.selectSubProyek?.values().next().value ?? 0,
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
  const renderCell = {
    keranjangproyek: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "hargamodal":
          return <Harga harga={data.hargamodal} />;
        case "harga":
          return <Harga harga={data.harga} />;
        case "hargakustom":
          return data.hargakustom != null ? (
            <Harga harga={data.hargakustom} />
          ) : (
            ""
          );
        case "totalharga-modal":
          return <Harga harga={data.jumlah * data.hargamodal} />;
        case "totalharga-jual":
          return <Harga harga={data.jumlah * data.harga} />;
        case "profit":
          return <Harga harga={data.harga - data.hargamodal} />;
        case "totalprofit":
          return (
            <Harga
              harga={data.jumlah * data.harga - data.jumlah * data.hargamodal}
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
  };
  const modal = {
    produk: useDisclosure(),
    penawaran: useDisclosure(),
    invoice: useDisclosure(),
    rekapitulasi: useDisclosure(),
    jenisproyek: useDisclosure(),
  };

  if (pengeluaranproyek.error) return <div>failed to load</div>;
  if (pengeluaranproyek.isLoading) return <div>loading...</div>;

  const col = [
    {
      key: "tanggal",
      label: "Tanggal",
    },
    {
      key: "kategoriproduk",
      label: "Kategori",
    },
    {
      key: "id_kustom",
      label: "Id",
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
      key: "jumlah",
      label: "Jumlah",
    },
    {
      key: "satuan",
      label: "Satuan",
    },
    {
      key: "harga",
      label: "Harga",
    },
    // {
    //   key: "hargajual",
    //   label: "Harga Jual",
    // },
    {
      key: "keterangan",
      label: "Keterangan",
    },
    // {
    //   key: "aksi",
    //   label: "Aksi",
    // },
  ];

  // console.log(form.selectSubProyek);
  return (
    <div>
      <div className="-w-11/12">
        <Table
          isStriped
          className="pt-3"
          aria-label="Example table with custom cells"
          topContent={
            <>
              <div>Filter</div>
              <div className="flex gap-3"></div>
              {/* <div className="flex flex-row gap-2">
              <Button color="primary" onClick={handleButtonExportToExcelPress}>
                Export to Excel
              </Button>
            </div> */}
            </>
          }
          bottomContent={
            pages > 0 ? (
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={pages}
                  onChange={(page) => setPage(page)}
                />
              </div>
            ) : null
          }
        >
          <TableHeader columns={col}>
            {(column) => (
              <TableColumn
                key={column.key}
                align={column.key === "actions" ? "center" : "start"}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={
              filteredData
                ? filteredData.slice(offset, offset + rowsPerPage)
                : []
            }
            loadingContent={"Loading..."}
            emptyContent={"Kosong"}
            loadingState={loadingState}
          >
            {(item) => (
              <TableRow key={item.id}>
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
                  label={`Harga Jual (Ref: ${form.refHarga})`}
                  placeholder="Masukkan harga!"
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      harga: v,
                    })
                  }
                />
                <Input
                  type="number"
                  value={form.hargakustom}
                  label="Harga Kustom"
                  placeholder="Hanya ditampilkan pada penawaran"
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      hargakustom: v,
                    })
                  }
                />
                <div>Harga Modal : {form.hargamodal}</div>
                <div>Harga Jual : {form.harga}</div>
                <div>Provit : {form.harga - form.hargamodal}</div>
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
                <div>Total Harga Jual : {form.harga * form.jumlah}</div>
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
                  Total Profit : {(form.harga - form.hargamodal) * form.jumlah}
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
    </div>
  );
}
