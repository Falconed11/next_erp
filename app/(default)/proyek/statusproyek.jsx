import { API_PATH } from "@/app/utils/apiconfig";
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
  Pagination,
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
import { useCallback, useMemo, useState } from "react";
import {
  deleteStatusProyek,
  saveStatusProyek,
} from "@/services/status-proyek.service";
import { renderStatusProyekCell } from "@/components/status-proyek/StatusProyekTableCell";
import { StatusProyekModal } from "@/components/status-proyek/StatusProyekModal";
import { useStatusProyekColumns } from "@/hooks/useStatusProyekColumns";
import { isValidProgress } from "@/app/utils/validation";
import { useClientFetch } from "@/hooks/useClientFetch";

const StatusProyek = () => {
  const { data: session } = useSession();
  const sessUser = session?.user;
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const offset = (page - 1) * rowsPerPage;
  const statusproyek = useClientFetch(
    `statusproyek?limit=${rowsPerPage}&offset=${offset}`,
  );
  const pages = Math.ceil(statusproyek?.data?.[0]?.nstatusproyek / rowsPerPage);
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
    if (!isValidProgress(form.progress)) {
      alert("Progres tidak valid. (0–100)");
      return;
    }
    const res = await saveStatusProyek(form);
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    statusproyek.mutate();
    onClose();
  };
  const deletePress = async ({ id, nama }) => {
    if (confirm(`Hapus status proyek id: ${id} nama: ${nama}?`)) {
      const res = await deleteStatusProyek(id);
      const json = await res.json();
      if (res.status == 400) return alert(json.message);
      statusproyek.mutate();
    }
  };
  const isHighRole = highRoleCheck(sessUser?.rank);
  const col = useStatusProyekColumns(isHighRole);
  const queryStates = renderQueryStates({ statusproyek }, session);
  if (queryStates) return queryStates;
  const loadingState = statusproyek.isLoading ? "loading" : "idle";
  return (
    <>
      <Table
        className="min-h-64"
        isStriped
        shadow="md"
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
          items={statusproyek.data}
          loadingContent={"Loading..."}
          emptyContent={"Kosong"}
          loadingState={loadingState}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderStatusProyekCell({
                    data: item,
                    columnKey,
                    onEdit: editPress,
                    onDelete: deletePress,
                  })}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <StatusProyekModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        form={form}
        setForm={setForm}
        onSave={simpanPress}
      />
    </>
  );
};
export { StatusProyek };
