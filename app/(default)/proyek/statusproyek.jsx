import { API_PATH, useClientFetch } from "@/app/utils/apiconfig";
import { getDateF } from "@/app/utils/date";
import {
  capitalizeEachWord,
  highRoleCheck,
  renderQueryStates,
} from "@/app/utils/tools";
import Harga from "@/components/harga";
import { AddIcon, DeleteIcon, EditIcon } from "@/components/icon";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";

const StatusProyek = () => {
  const session = useSession();
  const sessUser = session.data?.user;
  const statusproyek = useClientFetch("statusproyek");
  const [form, setForm] = useState({});
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const tambahPress = () => {
    setForm({ nama: "", method: "POST", title: "Tambah" });
    onOpen();
  };
  const editPress = (data) => {
    setForm({ ...data, method: "PUT", title: "Edit" });
    onOpen();
  };
  const simpanPress = async (onClose) => {
    const progress = form?.progress;
    if (!progress || progress > 100 || progress < 0)
      return alert("Progres tidak valid. (0-100)");
    const res = await fetch(`${API_PATH}statusproyek`, {
      method: form.method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    statusproyek.mutate();
    onClose();
  };
  const deletePress = async ({ id, nama }) => {
    if (confirm(`Hapus status proyek id: ${id} nama: ${nama}?`)) {
      const res = await fetch(`${API_PATH}statusproyek`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (res.status == 400) return alert(json.message);
      statusproyek.mutate();
    }
  };
  const renderCell = useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "id":
        return (
          <div className="text-right">
            <Harga harga={cellValue} />
          </div>
        );
      case "nproyek":
        return (
          <div className="text-right">
            <Harga harga={cellValue} />
          </div>
        );
      case "progress":
        return (
          <div className="text-right">
            <Harga harga={cellValue} />
          </div>
        );
      case "nama":
        return capitalizeEachWord(cellValue);
      case "tanggal":
        return data.tanggal ? getDateF(new Date(data.tanggal)) : "";
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit">
              <span
                onClick={() => editPress(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <EditIcon />
              </span>
            </Tooltip>
            {![-1, 1, 2, 3].includes(data.id) && (
              <Tooltip color="danger" content="Delete">
                <span
                  onClick={() => deletePress(data)}
                  className="text-lg text-danger cursor-pointer active:opacity-50"
                >
                  <DeleteIcon />
                </span>
              </Tooltip>
            )}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  const queryStates = renderQueryStates({ statusproyek }, session);
  if (queryStates) return queryStates;
  const isHighRole = highRoleCheck(sessUser.rank);
  const loadingState = statusproyek.isLoading ? "loading" : "idle";
  const col = [
    ...(isHighRole
      ? [
          {
            key: "aksi",
            label: "Aksi",
          },
        ]
      : []),
    {
      key: "id",
      label: "Id",
    },
    {
      key: "nama",
      label: "Status",
    },
    {
      key: "progress",
      label: "Progress (%)",
    },
    {
      key: "nproyek",
      label: "Jumlah Proyek",
    },
  ];
  return (
    <>
      <Table
        isStriped
        className=""
        topContent={
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold">Status Proyek</div>
            {isHighRole && (
              <Button
                onPress={tambahPress}
                variant="shadow"
                size="sm"
                color="primary"
              >
                <span className="text-xl font-bold">
                  <AddIcon />
                </span>
                Tambah
              </Button>
            )}
          </div>
        }
        bottomContent={<></>}
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
          items={statusproyek.data}
          loadingContent={"Loading..."}
          emptyContent={"Kosong"}
          loadingState={loadingState}
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
                {form.title} Status Proyek
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  variant="bordered"
                  label="Status"
                  placeholder="Masukkan status!"
                  value={form.nama}
                  onValueChange={(val) => setForm({ ...form, nama: val })}
                />
                <NumberInput
                  hideStepper
                  isWheelDisabled
                  formatOptions={{
                    useGrouping: false,
                  }}
                  variant="bordered"
                  label="Progress"
                  placeholder="Masukkan progress!"
                  value={form.progress}
                  onValueChange={(val) => setForm({ ...form, progress: val })}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={() => simpanPress(onClose)}>
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
export { StatusProyek };
