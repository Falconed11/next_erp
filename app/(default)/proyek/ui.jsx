"use client";
import React, { useState } from "react";
import { useClientFetch, getApiPath } from "../../utils/apiconfig";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import Link from "next/link";

import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
} from "../../components/icon";

const apiPath = getApiPath();
export default function App() {
  const proyek = useClientFetch("proyek");
  const stok = useClientFetch("stok");
  const [custom, setCustom] = useState({
    nama: "",
  });
  const keranjangproyek = useClientFetch(
    `keranjangproyek?id_proyek=${custom.id}`
  );
  const [form, setForm] = useState({
    id: "",
    nama: "",
    merek: "",
    tipe: "",
    satuan: "",
    harga: "",
    jumlah: "",
    keterangan: "",
  });
  const [method, setMethod] = useState("POST");
  const modaldetail = <>Detail</>;
  const modalform = (
    <>
      <Input
        type="text"
        label="Nama"
        placeholder="Masukkan nama!"
        value={custom.nama}
        onValueChange={(val) => setCustom({ ...custom, nama: val })}
      />
      <Input
        type="text"
        label="Klien"
        placeholder="Masukkan klien!"
        value={custom.klien}
        onValueChange={(val) => setCustom({ ...custom, klien: val })}
      />
      <Input
        type="text"
        label="Status"
        placeholder="Masukkan status!"
        value={custom.status}
        onValueChange={(val) => setCustom({ ...custom, status: val })}
      />
      <Textarea
        label="Keterangan"
        labelPlacement="inside"
        placeholder="Masukkan keterangan!"
        value={custom.keterangan}
        onValueChange={(val) => setCustom({ ...custom, keterangan: val })}
      />
    </>
  );

  const saveButtonPress = async () => {
    // if (form.nama == "" || form.kategori == "")
    //   return alert("Nama, dan Kategori harus diisi!");
    const res = await fetch(`${apiPath}proyek`, {
      method: custom.method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(custom),
    });
    const json = await res.json();
    return alert(json.message);
  };
  const tambahButtonPress = () => {
    setCustom({
      modaltitle: "Tambah Proyek",
      modalbody: "form",
      id: "",
      nama: "",
      klien: "",
      status: "",
      keterangan: "",
      method: "POST",
    });
    // setModalBody(modalform);
    // setForm({
    //   id: "",
    //   nama: "",
    //   klien: "",
    //   status: "",
    //   keterangan: "",
    // });
    // setMethod("POST");
    onOpen();
  };
  const editButtonPress = (selecteddata) => {
    setCustom({
      ...selecteddata,
      modaltitle: "Edit Proyek",
      modalbody: "form",
      method: "PUT",
    });
    // setForm(selecteddata);
    // setModalBody(modalform);
    // setMethod("PUT");
    onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus proyek?")) {
      const res = await fetch(`${apiPath}proyek`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id }),
      });
      return alert(await res.json().then((json) => json.message));
    }
  };
  const detailButtonPress = (data) => {
    setCustom({
      ...data,
      modaltitle: "Detail Proyek",
      modalbody: "detail",
    });
    // setModalBody(modaldetail);
    detail.onOpen();
  };
  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "totalharga":
        return data.jumlah * data.harga;
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Detail">
              <Link href={`/proyek/detail?id=${data.id}`}>
                <span
                  // onClick={() => detailButtonPress(data)}
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                  <EyeIcon />
                </span>
              </Link>
            </Tooltip>
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
                onClick={() => deleteButtonPress(data.id)}
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
  const renderCellDetail = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "totalharga-beli":
        return data.jumlah * data.harga;
      case "totalharga-jual":
        return data.jumlah * data.hargajual;
      case "profit":
        return data.jumlah * data.hargajual - data.jumlah * data.harga;
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Detail">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="Edit">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  const renderCellStok = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "totalharga":
        return data.jumlah * data.harga;
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Tambah ke proyek">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <AddIcon />
              </span>
            </Tooltip>
            {/* <Tooltip color="danger" content="Delete">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon />
              </span>
            </Tooltip> */}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const detail = useDisclosure();
  const modalproduk = useDisclosure();
  const [modalBody, setModalBody] = useState(<></>);

  if (proyek.error) return <div>failed to load</div>;
  if (proyek.isLoading) return <div>loading...</div>;
  if (keranjangproyek.error) return <div>failed to load</div>;
  if (keranjangproyek.isLoading) return <div>loading...</div>;
  if (stok.error) return <div>failed to load</div>;
  if (stok.isLoading) return <div>loading...</div>;

  const columns = [
    {
      key: "nama",
      label: "Nama",
    },
    {
      key: "klien",
      label: "Klien",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "keterangan",
      label: "Keterangan",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];
  const colproduk = [
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
      key: "aksi",
      label: "Aksi",
    },
  ];
  const coljasa = [
    {
      key: "nama",
      label: "Nama",
    },
    {
      key: "satuan",
      label: "Satuan",
    },
    {
      key: "jumlah",
      label: "Jumlah",
    },
    {
      key: "harga",
      label: "Harga",
    },
    {
      key: "total-harga",
      label: "Total Harga",
    },
  ];
  const colstok = [
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
      key: "jumlah",
      label: "Jumlah",
    },
    {
      key: "harga",
      label: "Harga",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];
  const colpengeluaran = [
    {
      key: "nama",
      label: "Nama",
    },
    {
      key: "tanggal",
      label: "Tanggal",
    },
    {
      key: "jenispengeluaran",
      label: "Jenis Pengeluaran",
    },
    {
      key: "harga",
      label: "Harga",
    },
    {
      key: "keterangan",
      label: "Keterangan",
    },
  ];
  const dataproduk = [];
  const datajasa = [];
  const datapengeluaran = [];
  const modaltitle = method == "POST" ? "Tambah Proyek" : "Edit Proyek";

  return (
    <div className="flex-col">
      <Button className="bg-background" onPress={tambahButtonPress}>
        Tambah
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {custom.modaltitle}
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Nama"
                  placeholder="Masukkan nama!"
                  value={custom.nama}
                  onValueChange={(val) => setCustom({ ...custom, nama: val })}
                />
                <Input
                  type="text"
                  label="Klien"
                  placeholder="Masukkan klien!"
                  value={custom.klien}
                  onValueChange={(val) => setCustom({ ...custom, klien: val })}
                />
                <Input
                  type="text"
                  label="Status"
                  placeholder="Masukkan status!"
                  value={custom.status}
                  onValueChange={(val) => setCustom({ ...custom, status: val })}
                />
                <Textarea
                  label="Keterangan"
                  labelPlacement="inside"
                  placeholder="Masukkan keterangan!"
                  value={custom.keterangan}
                  onValueChange={(val) =>
                    setCustom({ ...custom, keterangan: val })
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={saveButtonPress}>
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        scrollBehavior="inside"
        size="5xl"
        isOpen={detail.isOpen}
        onOpenChange={detail.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {custom.modaltitle}
              </ModalHeader>
              <ModalBody>
                <div>Nama : {custom.nama}</div>
                <div>Klien : {custom.klien}</div>
                <div>Produk:</div>
                <div>
                  <Button onClick={modalproduk.onOpen} color="primary">
                    Tambah
                  </Button>
                </div>
                <Table
                  className="pt-3"
                  aria-label="Example table with custom cells"
                >
                  <TableHeader columns={colproduk}>
                    {(column) => (
                      <TableColumn
                        key={column.key}
                        align={column.key === "actions" ? "center" : "start"}
                      >
                        {column.label}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={keranjangproyek.data}>
                    {(item) => (
                      <TableRow key={item.id}>
                        {(columnKey) => (
                          <TableCell>
                            {renderCellDetail(item, columnKey)}
                          </TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div>Jasa :</div>
                <Table
                  className="pt-3"
                  aria-label="Example table with custom cells"
                >
                  <TableHeader columns={coljasa}>
                    {(column) => (
                      <TableColumn
                        key={column.key}
                        align={column.key === "actions" ? "center" : "start"}
                      >
                        {column.label}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={datajasa}>
                    {(item) => (
                      <TableRow key={item.id}>
                        {(columnKey) => (
                          <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div>Pengeluaran :</div>
                <Table
                  className="pt-3"
                  aria-label="Example table with custom cells"
                >
                  <TableHeader columns={colpengeluaran}>
                    {(column) => (
                      <TableColumn
                        key={column.key}
                        align={column.key === "actions" ? "center" : "start"}
                      >
                        {column.label}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={datapengeluaran}>
                    {(item) => (
                      <TableRow key={item.id}>
                        {(columnKey) => (
                          <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div>Modal :</div>
                <div>Total Harga :</div>
                <div>Provit :</div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary">Simpan</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="5xl"
        isOpen={modalproduk.isOpen}
        onOpenChange={modalproduk.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Tambah Produk
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Nama"
                  placeholder="Masukkan nama!"
                  value={custom.nama}
                  onValueChange={(val) => setCustom({ ...custom, nama: val })}
                />
                <Table
                  className="pt-3"
                  aria-label="Example table with custom cells"
                >
                  <TableHeader columns={colstok}>
                    {(column) => (
                      <TableColumn
                        key={column.key}
                        align={column.key === "aksi" ? "center" : "start"}
                      >
                        {column.label}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={stok.data}>
                    {(item) => (
                      <TableRow key={item.id}>
                        {(columnKey) => (
                          <TableCell>
                            {renderCellStok(item, columnKey)}
                          </TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary">Simpan</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Table className="pt-3" aria-label="Example table with custom cells">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "actions" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={proyek.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
