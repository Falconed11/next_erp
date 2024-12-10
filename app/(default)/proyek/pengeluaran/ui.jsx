"use client";
import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  User,
  Chip,
  Tooltip,
  ChipProps,
  getKeyValue,
} from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";
import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import {
  getCurFirstLastDay,
  excelToJSDate,
  getDateF,
  getDateFId,
  getDate,
} from "@/app/utils/date";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import Harga from "@/components/harga";
import { FileUploader, RangeDate } from "@/components/input";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
} from "@/components/icon";
import { MyChip } from "@/components/mycomponent";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const api_path = getApiPath();

const [startDate, endDate] = getCurFirstLastDay();

export default function UI() {
  const [filter, setFilter] = useState({
    startDate,
    endDate,
    selectKategori: new Set([]),
  });
  const pengeluaran = useClientFetch(
    `pengeluaranproyek?start=${getDate(filter.startDate)}&end=${getDate(
      filter.endDate
    )}`
  );
  const [form, setForm] = useState({});
  const [json, setJson] = useState([]);
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;

  const filteredData = pengeluaran?.data;

  const pages = useMemo(() => {
    return filteredData ? Math.ceil(filteredData?.length / rowsPerPage) : 0;
  }, [filteredData?.length, rowsPerPage]);
  const loadingState = pengeluaran.isLoading ? "loading" : "idle";
  const offset = (page - 1) * rowsPerPage;

  const editButtonPress = (data) => {
    const startdate = new Date(data.tanggal);
    setForm({
      ...form,
      ...data,
      harga: data.hargakustom,
      modalmode: "Edit",
      tanggal: getDate(startdate),
      startdate,
    });
    modal.onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus produk?")) {
      const res = await fetch(`${api_path}pengeluaranproyek`, {
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
  const simpanButtonPress = async (data, onClose) => {
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
        status: data.status ? data.status : "",
        tanggal: getDate(new Date(data.startdate)),
        // harga: data.hargajual,
      }),
    });
    const json = await res.json();
    onClose();
    // console.log(json.message);
    // return alert(json.message);
  };

  const handleFileUpload = (jsonData) => {
    // console.log(jsonData);
    // Do something with the converted JSON object, e.g., send it to an API
    jsonData = jsonData.map((v) => {
      v.tanggal = getDate(excelToJSDate(v.tanggal));
      return v;
    });
    setJson(jsonData);
    console.log(jsonData);
  };
  const handleButtonUploadExcelPress = async () => {
    if (json.length == 0) return alert("File belum dipilih");
    setReportList([]);
    try {
      const responses = await Promise.all(
        json.map((v) =>
          fetch(`${api_path}pengeluaranproyek`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({ ...v, id_second: v.id }),
          })
        )
      );
      const dataArray = await Promise.all(
        responses.map((response) => response.json())
      );
      setReportList(dataArray.map((v, i) => `${i + 1}. ${v.message}`));
    } catch (e) {
      console.error(e);
    }
    setJson([]);
    report.onOpen();
  };
  const handleButtonExportToExcelPress = () => {
    const rows = pengeluaran.data.map((v) => {
      const totalHarga = (v.hargakustom ?? v.hargajual) * v.jumlah;
      return {
        tanggal: v.tanggal,
        id_proyek: v.id_proyek,
        namaproyek: v.namaproyek,
        instansi: v.instansi,
        id_pengeluaranproyek: v.id_pengeluaranproyek,
        jumlah: v.jumlah,
        hargakustom: v.hargakustom,
        status: v.status,
        keterangan: v.keteranganpp,
        karyawan: v.namakaryawan,
        id_kustomproduk: v.id_kustom,
        kategori: v.kategori,
        produk: v.nama,
        tipe: v.tipe,
        stok: v.stok,
        satuan: v.satuan,
        merek: v.merek,
        vendor: v.vendor,
        hargamodal: v.hargamodal,
        hargajual: v.hargajual,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.writeFile(
      workbook,
      `pengeluaran_${getDateF(filter.startDate)}_${getDateF(
        filter.endDate
      )}.xlsx`,
      { compression: true }
    );
  };

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    let harga = 0;
    if (data.hargakustom) harga = data.hargakustom;
    if (data.hargamodal && !data.hargakustom) harga = data.hargamodal;
    switch (columnKey) {
      case "lunas":
        return (
          <MyChip
            text={data.lunas == 1 ? "Lunas" : "Hutang"}
            theme={data.lunas == 1 ? "success" : "danger"}
          />
        );
      case "tanggal":
        return getDateF(new Date(data.tanggal));
      case "harga":
        return (
          <div className="text-right">
            <Harga harga={harga} />
          </div>
        );
      case "totalharga":
        return (
          <div className="text-right">
            <Harga harga={data.jumlah * harga} />
          </div>
        );
      case "totalharga-jual":
        return <Harga harga={data.jumlah * data.hargajual} />;
      case "profit":
        return <Harga harga={data.hargajual - data.hargamodal} />;
      case "totalprofit":
        return (
          <Harga
            harga={data.jumlah * data.hargajual - data.jumlah * data.hargamodal}
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
                onClick={() => deleteButtonPress(data.id_pengeluaranproyek)}
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

  const modal = useDisclosure();
  const [reportList, setReportList] = useState([]);
  const report = useDisclosure();

  if (pengeluaran.error) return <div>failed to load</div>;
  if (pengeluaran.isLoading) return <div>loading...</div>;

  const col = [
    {
      key: "tanggal",
      label: "tanggal",
    },
    {
      key: "id_second",
      label: "Id Proyek",
    },
    {
      key: "namaproyek",
      label: "Nama Proyek",
    },
    {
      key: "instansi",
      label: "Instansi",
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
      key: "lunas",
      label: "Status",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];
  return (
    <div>
      {/* <div className="flex flex-row gap-2">
        <div>
          <Link
            className="bg-primary text-white p-2 rounded-lg inline-block"
            href={"/pengeluaranproyek.xlsx"}
          >
            Download Format
          </Link>
        </div>
        <FileUploader onFileUpload={handleFileUpload} />
        <Button color="primary" onPress={handleButtonUploadExcelPress}>
          Upload Excel
        </Button>
      </div> */}
      <Table
        className="pt-3"
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div>Filter</div>
            <div className="flex flex-row gap-2">
              <div className="flex flex-col bg-gray-100 rounded-lg">
                {/* <DatePicker
                  dateFormat="dd/MM/yyyy"
                  selected={filter.startDate}
                  onChange={(date) => setFilter({ ...filter, startDate: date })}
                  selectsStart
                  startDate={filter.startDate}
                  endDate={filter.endDate}
                />
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  selected={filter.endDate}
                  onChange={(date) => setFilter({ ...filter, endDate: date })}
                  selectsEnd
                  startDate={filter.startDate}
                  endDate={filter.endDate}
                  minDate={filter.startDate}
                /> */}
                <RangeDate current={filter} setCurrent={setFilter} />
              </div>
            </div>
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
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={
            filteredData ? filteredData.slice(offset, offset + rowsPerPage) : []
          }
          loadingContent={"Loading..."}
          emptyContent={"Kosong"}
          loadingState={loadingState}
        >
          {(item) => (
            <TableRow key={item.id_pengeluaranproyek}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.isOpen}
        onOpenChange={modal.onOpenChange}
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
                <div>Harga Modal : {<Harga harga={form.hargamodal} />}</div>
                <Input
                  type="number"
                  value={form.harga}
                  label="Harga Kustom"
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
      {/* upload report */}
      <Modal
        isOpen={report.isOpen}
        onOpenChange={report.onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Hasil Upload
              </ModalHeader>
              <ModalBody>
                {reportList.map((r, i) => (
                  <div key={i}>{r}</div>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
