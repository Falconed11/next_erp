// components/TablePrint.jsx
import { getDateF } from "@/app/utils/date";
import { fIdProyek } from "@/app/utils/formatid";
import Harga from "@/components/harga";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { forwardRef, useCallback } from "react";

const PrintDaftarProyek = forwardRef(
  (
    {
      data,
      idInstansi,
      loadingState,
      //   idKaryawan,
      //   idStatusProyek,
      //   sort,
      //   idProduk,
      //   startDate,
      //   endDate,
    },
    ref
  ) => {
    // const proyek = useClientFetch(
    //   `proyek?${idInstansi ? `id_instansi=${idInstansi}` : ""}${
    //     idKaryawan ? `id_karyawan=${idKaryawan}` : ""
    //   }${startDate ? `&start=${getDate(startDate)}` : ""}${
    //     endDate ? `&end=${getDate(endDate)}` : ""
    //   }${
    //     idStatusProyek ? `&id_statusproyek=${idStatusProyek}` : ""
    //   }&sort=${sort}&id_produk=${idProduk || ""}`
    // );
    const renderCell = useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      const date = new Date(data.tanggal);
      const versi = data.versi;
      const peran = data.peran;
      const idStatusProyek = data.id_statusproyek;
      const tanggalReject = data.tanggal_reject;
      const sTanggal = "text-white font-bold p-1 rounded";
      switch (columnKey) {
        case "swasta":
          return data.swasta ? "swasta" : "negri";
        case "progress":
          return (
            <div className="text-right">
              <Harga harga={cellValue} />
            </div>
          );
        case "tanggal":
          return (
            <div>
              {data.id_statusproyek == -1 ? (
                tanggalReject ? (
                  <span>{getDateF(new Date(tanggalReject))}</span>
                ) : (
                  ""
                )
              ) : cellValue && data.progress == 100 ? (
                <span>{getDateF(new Date(cellValue))}</span>
              ) : (
                ""
              )}
            </div>
          );
        case "tanggal_penawaran":
          return getDateF(new Date(data.tanggal_penawaran));
        case "id_kustom":
          return data.versi > 0
            ? fIdProyek(data.id_kustom, new Date(data.tanggal))
            : "";
        default:
          return cellValue;
      }
    }, []);
    const columns = [
      {
        key: "tanggal_penawaran",
        label: "Tanggal Penawaran",
      },
      {
        key: "statusproyek",
        label: "Status",
      },
      {
        key: "tanggal",
        label: "Tanggal Deal/Reject",
      },
      {
        key: "id_second",
        label: "Id Proyek",
      },
      //   {
      //     key: "namaperusahaan",
      //     label: "Nama Perusahaan",
      //   },
      {
        key: "swasta",
        label: "Swasta/Negri",
      },
      {
        key: "nama",
        label: "Nama Proyek",
      },
      ...(!idInstansi
        ? [
            {
              key: "instansi",
              label: "Customer",
            },
          ]
        : []),
      //   {
      //     key: "klien",
      //     label: "Klien",
      //   },
      {
        key: "kota",
        label: "Kota",
      },
      {
        key: "id_po",
        label: "No. PO",
      },
      {
        key: "namakaryawan",
        label: "Sales",
      },
      {
        key: "progress",
        label: "Progress (%)",
      },
      {
        key: "keterangan",
        label: "Keterangan",
      },
    ];
    const textSize = "text-[9px]";
    return (
      <div ref={ref} className="hidden print:block">
        <Table
          isStriped
          className={`overscroll-none ${textSize}`}
          classNames={{
            wrapper: "p-0 rounded-none gap-0 overscroll-none overflow-hidden",
            table:
              "m-0 p-0 border-b border-black border-collapse rounded-none overscroll-none",
            thead: "rounded-none bg-transparent [&>tr:last-child]:hidden",
            th: `border-y border-black text-black bg-transparent px-0 py-0 h-0 whitespace-normal break-words ${textSize}`,
            td: `px-0 py-0 leading-none- align-top ${textSize}`,
            tr: "m-0 p-0",
            base: "rounded-none shadow-none overscroll-none",
          }}
          aria-label="Project Table for Print"
          // selectionMode="multiple"
          topContent={<div>Daftar Proyek</div>}
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
            items={data.slice(0, 100)}
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
      </div>
    );
  }
);

PrintDaftarProyek.displayName = "PrintDaftarProyek";
export default PrintDaftarProyek;
