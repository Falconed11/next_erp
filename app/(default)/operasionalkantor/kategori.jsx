"use client";
import { useCallback, useState } from "react";
import { getApiPath } from "@/app/utils/apiconfig";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
} from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { Input } from "@heroui/react";
import { EditIcon, DeleteIcon, TransferIcon } from "@/components/icon";
import { getDateF } from "@/app/utils/date";
import Harga from "@/components/harga";
import ModalTransferData from "@/components/modaltransferdata";
import "react-datepicker/dist/react-datepicker.css";
import { capitalizeEachWord, highRoleCheck } from "@/app/utils/tools";
import { TableHeaderWithAddButton } from "@/components/mycomponent";
import { useClientFetch } from "@/hooks/useClientFetch";
import { apiFetch } from "@/app/utils/fetchHelper";

const apiPath = getApiPath();

export default function App({ sessionuser }) {
  const [id, setId] = useState();
  const [newId, setNewId] = useState();
  const [name, setName] = useState();
  const [form, setForm] = useState();
  const kategorioperasionalkantor = useClientFetch(`kategorioperasionalkantor`);
  const queries = { kategorioperasionalkantor };
  const saveButtonPress = async (onClose) => {
    // if (form.isSwasta.size == 0) return alert("Swasta/Negri belum diisi");
    try {
      const json = await apiFetch(`${apiPath}kategorioperasionalkantor`, {
        method: form.method,
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ ...form, lastuser: sessionuser.id_karyawan }),
      });
      kategorioperasionalkantor.mutate();
      onClose();
    } catch (error) {
      alert(
        error.message ||
          "An error occurred while saving kategori operasional kantor.",
      );
    }
  };
  const onSave = async (onClose) => {
    try {
      const json = await apiFetch(`${apiPath}transferoperasionalkantor`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id, newId }),
      });
      kategorioperasionalkantor.mutate();
      onClose();
    } catch (error) {
      alert(
        error.message ||
          "An error occurred while transferring kategori operasional kantor.",
      );
    }
  };
  const tambahButtonPress = () => {
    setForm({
      id: "",
      nama: "",
      alamat: "",
      method: "POST",
      title: "Tambah",
    });
    onOpen();
  };
  const editButtonPress = (data) => {
    setForm({
      ...data,
      selectSwasta: new Set([String(data.swasta)]),
      method: "PUT",
      title: "Edit",
    });
    onOpen();
  };
  const transferButtonPress = (data) => {
    setId(data.id);
    setName(data.nama);
    setNewId(null);
    transfer.onOpen();
  };
  const deleteButtonPress = async (id, nama) => {
    if (confirm(`Hapus kategori id: ${id}, nama: ${nama}?`)) {
      try {
        const json = await apiFetch(`${apiPath}kategorioperasionalkantor`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({ id }),
        });
        kategorioperasionalkantor.mutate();
      } catch (error) {
        alert(
          error.message ||
            "An error occurred while deleting kategori operasional kantor.",
        );
      }
    }
  };
  const renderCell = useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    const date = new Date(data.tanggal);
    const hutang = data.hutang ?? 0;
    switch (columnKey) {
      case "tanggal":
        return getDateF(new Date(data.tanggal));
      case "totalharga":
        return data.jumlah * data.harga;
      case "nama":
        return capitalizeEachWord(cellValue);
      case "totaltransaksi":
        return (
          <div className="text-right">
            <Harga harga={cellValue} />
          </div>
        );
      case "totalbiaya":
        return (
          <div className="text-right">
            <Harga harga={cellValue} />
          </div>
        );
      case "lastupdate":
        return (data.namakaryawan || "nn") + ", " + getDateF(data.lastupdate);
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
            {/* <LinkOpenNewTab
                content="Detail"
                link={`/proyek?id_instansi=${data.id}`}
                icon={<EyeIcon />}
              /> */}
            <Tooltip content="Transfer">
              <span
                onClick={() => transferButtonPress(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <TransferIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" variant="solid" content="Delete">
              <span
                onClick={() => deleteButtonPress(data.id, data.nama)}
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
  const transfer = useDisclosure();
  for (const [name, data] of Object.entries(queries)) {
    if (data.error) return <div>Failed to load {name}</div>;
    if (data.isLoading) return <div>Loading {name}...</div>;
  }
  const columns = [
    {
      key: "aksi",
      label: "Aksi",
    },
    {
      key: "nama",
      label: "Kategori",
    },
    {
      key: "totaltransaksi",
      label: "Jumlah Transaksi",
    },
    // {
    //   key: "totalbiaya",
    //   label: "Pengeluaran",
    // },
  ];
  return (
    <>
      <Table
        isStriped
        className=""
        aria-label="Example table with custom cells"
        topContent={
          <TableHeaderWithAddButton
            isHighRole={highRoleCheck(sessionuser.rank)}
            title="Kategori Operasional Kantor"
            onPress={tambahButtonPress}
          />
        }
      >
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
        <TableBody
          items={kategorioperasionalkantor.data}
          emptyContent={"Kosong"}
        >
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
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.title} Kategori Operasional Kantor
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Nama"
                  placeholder="Masukkan nama kategori!"
                  value={form.nama}
                  onValueChange={(val) => setForm({ ...form, nama: val })}
                />
                {/* <Textarea
                  label="Keterangan"
                  labelPlacement="inside"
                  placeholder="Masukkan keterangan!"
                  value={form.keterangan}
                  onValueChange={(val) => setForm({ ...form, keterangan: val })}
                /> */}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onClick={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  onClick={() => saveButtonPress(onClose)}
                >
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <ModalTransferData
        title="Kategori"
        data={kategorioperasionalkantor.data}
        isOpen={transfer.isOpen}
        onOpenChange={transfer.onOpenChange}
        id={id}
        newId={newId}
        setNewId={setNewId}
        name={name}
        valueKey={"id"}
        labelKey={"nama"}
        onSave={onSave}
      />
    </>
  );
}
