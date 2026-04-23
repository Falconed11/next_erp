import { getDateFId } from "@/app/utils/date";
import {
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
import { highRoleCheck, renderQueryStates, sortItems } from "@/app/utils/tools";
import { useSession } from "next-auth/react";
import { NumberComp } from "../harga";
import { LIST_SWASTA_NEGRI } from "@/app/utils/const";
import {
  useGetMonthlyReportByPeriode,
  useProyekReportsColumns,
} from "@/hooks/proyek.hooks";
import { tableClassName, tableClassNames } from "@/app/utils/style";
import { useMemo, useState } from "react";
import { OpenBlueLinkInNewTab } from "../mycomponent";
import { number2Nominal } from "@/app/utils/number";
import { useAutocompleteField } from "../myautocomplete";
import { PROYEK_ENDPOINT } from "@/services/proyek.service";

export const renderTableCellProyek = ({ data, columnKey }) => {
  const cellValue = data[columnKey];
  switch (columnKey) {
    case "nama":
      return (
        <OpenBlueLinkInNewTabProyek idProyek={data.id}>
          {cellValue || "noname"}
        </OpenBlueLinkInNewTabProyek>
      );
    case "totalpengeluaran":
      return <NumberComp value={cellValue} />;
    case "totalpembayaran":
      return <NumberComp value={cellValue} />;
    case "profit":
      return <NumberComp value={cellValue} />;
    case "swasta":
      return cellValue != null && LIST_SWASTA_NEGRI[cellValue].nama;
    case "tanggal":
      return <div className="text-nowrap">{getDateFId(cellValue)}</div>;
    case "riwayatpembayaran":
      return (
        <div className="text-nowrap">
          {data.pembayaran
            .map(
              (o, i) =>
                `${getDateFId(o.tanggal)} ${o.metodepembayaran} ${number2Nominal(o.nominal)}`,
            )
            .join(", ")}
        </div>
      );
    // case "aksi":
    //   return (
    //     <div className="flex items-center gap-2 text-lg">
    //       <Tooltip content="Edit">
    //         <span
    //           onClick={() => onEdit(data)}
    //           className="cursor-pointer text-default-400"
    //         >
    //           <EditIcon />
    //         </span>
    //       </Tooltip>
    //       <Tooltip color="danger" content="Delete">
    //         <span
    //           onClick={() => onDelete(data.id)}
    //           className="cursor-pointer text-danger"
    //         >
    //           <DeleteIcon />
    //         </span>
    //       </Tooltip>
    //     </div>
    //   );
    default:
      return cellValue;
  }
};
export const TableProyek = ({
  from,
  to,
  jenisproyek,
  jenisinstansi,
  golonganinstansi,
  perusahaan,
}) => {
  const session = useSession();
  const sessUser = session?.data?.user;

  const proyekReports = useGetMonthlyReportByPeriode({
    from,
    to,
    jenisproyek,
    jenisinstansi,
    golonganinstansi,
    perusahaan,
  });

  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id_second",
    direction: "ascending",
  });

  const sortedItems = useMemo(
    () => sortItems(proyekReports?.data?.data || [], sortDescriptor),
    [proyekReports?.data?.data, sortDescriptor],
  );
  const { totalPembayaran, totalPengeluaran, profit } = useMemo(() => {
    const items = [...(proyekReports?.data?.data || [])];
    return items.reduce(
      ({ totalPembayaran, totalPengeluaran, profit }, val) => {
        return {
          totalPembayaran: totalPembayaran + val.totalpembayaran,
          totalPengeluaran: totalPengeluaran + val.totalpengeluaran,
          profit: profit + val.profit,
        };
      },
      {
        totalPembayaran: 0,
        totalPengeluaran: 0,
        profit: 0,
      },
    );
  }, [proyekReports?.data?.data]);

  const loadingState = proyekReports.isLoading ? "loading" : "idle";
  const isHighRole = highRoleCheck(sessUser?.rank);
  const columns = useProyekReportsColumns(isHighRole);
  const QueryState = renderQueryStates({ proyekReports }, session);
  if (QueryState) return QueryState;
  const { data: items } = proyekReports.data;
  console.log(items);

  const id_karyawan = sessUser.id_karyawan;
  return (
    <>
      <Table
        isStriped
        className={tableClassName}
        classNames={tableClassNames}
        aria-label="Example table with custom cells"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        topContent={
          <div className="flex gap-2">
            <div className="table">
              <div className="table-row-group">
                {[
                  ["Omset", ":", <NumberComp value={totalPembayaran} />],
                  [
                    "Biaya Produksi",
                    ":",
                    <NumberComp value={totalPengeluaran} />,
                  ],
                  ["Profit", ":", <NumberComp value={profit} />],
                ].map((cells, i) => (
                  <div key={i} className="table-row">
                    {cells.map((cell, i) => (
                      <div
                        key={i}
                        className={`table-cell ${i != 0 ? "pl-2" : ""}`}
                      >
                        <div>{cell}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "actions" ? "center" : "start"}
              allowsSorting
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={sortedItems}
          loadingContent={"Loading..."}
          emptyContent={"Kosong"}
          loadingState={loadingState}
        >
          {(item) => {
            return (
              <TableRow className="" key={item.id}>
                {(columnKey) => (
                  <TableCell className="">
                    <div className="text-nowrap">
                      {renderTableCellProyek({
                        data: item,
                        columnKey,
                      })}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </>
  );
};
export const OpenBlueLinkInNewTabProyek = ({ children, idProyek }) => {
  return (
    <OpenBlueLinkInNewTab link={`/proyek?id_proyek=${idProyek}`}>
      {children}
    </OpenBlueLinkInNewTab>
  );
};

export const AutocompleteProyek = (props) => {
  const { component } = useAutocompleteField({
    endpoint: `proyek?aktif=1&sort=tanggal_penawaran`,
    title: "Proyek",
    field: "proyek",
    id: "id_proyek",
    disableCustomValue: true,
    getCustomLabel: (item) =>
      `${item.id} | ${item.nama} | ${item.namaperusahaan} | ${item.instansi} | ${getDateFId(item.tanggal_penawaran)}`,
    getCustomValue: (item) =>
      `${item.id} | ${item.nama} | ${item.namaperusahaan} | ${item.instansi} | ${getDateFId(item.tanggal_penawaran)}`,
    ...props,
  });
  return component;
};
