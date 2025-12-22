import DatePicker from "react-datepicker";
import {
  Input,
  NumberInput,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
} from "@heroui/react";
import { getDate } from "@/app/utils/date";
import Harga from "@/components/harga";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import { key2set, set2key, renderQueryStates } from "@/app/utils/tools";
import { useCallback } from "react";
import { DeleteIcon, EditIcon } from "@/components/icon";
const apiPath = getApiPath();

const ProdukMenunggu = ({ id_proyek, form, setForm }) => {
  const produkmenunggu = useClientFetch(
    `v2/proyek/${id_proyek}/produkmenunggu`
  );
  const renderCell = useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "status":
        return data.status == 1 ? "Lunas" : "Belum Lunas";
      case "tanggal":
        return getDateF(new Date(data.tanggalpengeluaran));
      case "produkmenunggu":
        return (
          <div className="text-right">
            <Harga harga={cellValue} />
          </div>
        );
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit">
              <span
                onClick={() =>
                  setForm({
                    ...form,
                    ...data,
                    isSelected: false,
                    id_produk: data.id,
                    produk: data.nama,
                    id_kategori: data.idkategoriproduk,
                    id_merek: data.idmerek,
                    harga: data.hargamodal,
                  })
                }
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <EditIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  const queryStates = renderQueryStates({ produkmenunggu });
  if (queryStates) return queryStates;
  const col = [
    {
      key: "aksi",
      label: "Aksi",
    },
    {
      key: "nama",
      label: "Produk",
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
      key: "produkmenunggu",
      label: "Produk Menunggu",
    },
    {
      key: "keterangan",
      label: "Keterangan",
    },
  ];
  return (
    <Table
      className="z-10 w-fit"
      aria-label="Example table with custom cells"
      topContent={
        <>
          <div>Produk Menunggu</div>
        </>
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
      <TableBody items={produkmenunggu.data.data} emptyContent={"Kosong"}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ProdukMenunggu;
