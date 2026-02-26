import { EditIcon, DeleteIcon } from "@/components/icon";
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
import {
  capitalizeEachWord,
  highRoleCheck,
  renderQueryStates,
} from "@/app/utils/tools";
import { getDateFId, getTime } from "@/app/utils/date";
import { useSession } from "next-auth/react";
import { NumberComp } from "../harga";
import { LIST_SWASTA_NEGRI } from "@/app/utils/const";
import {
  useGetMonthlyReportByPeriode,
  useProyekReportsColumns,
} from "@/hooks/proyek.hooks";
import { tableClassName, tableClassNames } from "@/app/utils/style";
import { useMemo, useState } from "react";
import { label } from "framer-motion/client";

export const renderTableCellProyek = ({ data, columnKey }) => {
  const cellValue = data[columnKey];
  switch (columnKey) {
    case "totalpengeluaran":
      return <NumberComp value={cellValue} />;
    case "totalpembayaran":
      return <NumberComp value={cellValue} />;
    case "profit":
      return <NumberComp value={cellValue} />;
    case "swasta":
      return cellValue != null && LIST_SWASTA_NEGRI[cellValue].nama;
    case "tanggal":
      return `${getDateFId(cellValue)}`;
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
export const TableProyek = ({ from, to }) => {
  const session = useSession();
  const sessUser = session?.data?.user;

  const proyekReports = useGetMonthlyReportByPeriode({ from, to });

  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id_second",
    direction: "ascending",
  });

  const sortedItems = useMemo(() => {
    const items = [...(proyekReports?.data?.data || [])];
    items.sort((a, b) => {
      const col = sortDescriptor.column;

      let first = a[col];
      let second = b[col];

      const cmp =
        (first ?? "") < (second ?? "")
          ? -1
          : (first ?? "") > (second ?? "")
            ? 1
            : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
    return items;
  }, [proyekReports?.data?.data, sortDescriptor]);
  const { totalPembayaran, totalPengeluaran, profit } = useMemo(() => {
    const items = [...(proyekReports?.data?.data || [])];
    return items.reduce(
      ({ totalPembayaran, totalPengeluaran, profit }, val) => {
        return {
          totalPembayaran: totalPembayaran + val.totalpembayaran,
          totalPengeluaran: totalPengeluaran + val.totalpengeluaran,
          provit: profit + val.profit,
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
        topContent={[
          { label: "Omset", val: totalPembayaran },
          { label: "Biaya Produksi", val: totalPengeluaran },
          { label: "Provit", val: profit },
        ].map(({ label, val }) => (
          <div key={label}>
            {label} : <NumberComp value={val} />
          </div>
        ))}
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
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>
                    {renderTableCellProyek({
                      data: item,
                      columnKey,
                    })}
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
