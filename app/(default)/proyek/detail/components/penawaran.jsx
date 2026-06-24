import { countPercentProvit } from "@/app/utils/formula";
import { tableClassNames } from "@/app/utils/style";
import { updateSwitch } from "@/app/utils/tools";
import { ConditionalComponent } from "@/components/my/componentmanipulation";
import Harga from "@/components/my/harga";
import { DeleteIcon, EditIcon, EyeIcon } from "@/components/my/icon";
import {
  LinkOpenNewTab,
  MySwitch,
  OpenBlueLinkInNewTab,
} from "@/components/my/mycomponent";
import { TambahProdukPenawaran } from "@/components/penawaran/penawaran";
import {
  deleteKeranjangProyek,
  KERANJANG_PROYEK_ENDPOINT_v1,
} from "@/services/keranjang-proyek.service";
import {
  ScrollShadow,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { useCallback } from "react";

export const ProductTableSection = ({
  title,
  idProyek,
  instalasi,
  isAuthorized,
  isHighRole,
  mutateKeranjang,
  versi,
  user,
  columns,
  items,
  tableKey,
  summaryLabel,
  onEdit,
  topContent = null,
  className,
}) => {
  const parentData = { mutate: mutateKeranjang };
  const onDelete = async (id) => {
    if (confirm("Apakah anda yakin ingin menghapus item ini?")) {
      try {
        await deleteKeranjangProyek(id);
        mutateKeranjang();
      } catch (err) {
        console.log("Error deleting keranjang proyek:", err);
        alert(
          `Gagal menghapus item. Error: ${err.message || "Terjadi kesalahan."}`,
        );
      }
    }
  };
  const renderCell = useCallback(
    (data, columnKey) => {
      const cellValue = data[columnKey];
      const isChecked = (v) => {
        return !!v;
      };
      const showMerek = isChecked(data.showmerek);
      const showTipe = isChecked(data.showtipe);
      const idKeranjangProyek = data.id_keranjangproyek;
      switch (columnKey) {
        case "nama":
          return (
            <OpenBlueLinkInNewTab link={`/produk?id=${data.id_produk}`}>
              {cellValue}
            </OpenBlueLinkInNewTab>
          );
        case "stok":
          return (
            <div
              className={`text-right px-1 ${
                data.jumlah > data.stok ? "text-white bg-danger rounded-sm" : ""
              }`}
            >
              {cellValue}
            </div>
          );
        case "jumlah":
          return <div className="text-right">{cellValue}</div>;
        case "temphargamodal":
          return (
            <div className="text-right">
              <Harga harga={cellValue} />
            </div>
          );
        case "refhargajualmargin":
          return (
            <div className="text-right">
              <Harga harga={data.margin} />
            </div>
          );
        case "harga":
          return (
            <div className="text-right">
              <Harga harga={data.harga} />
            </div>
          );
        case "hargakustom":
          return data.hargakustom != null ? (
            <Harga harga={data.hargakustom} />
          ) : (
            ""
          );
        case "totalharga-modal":
          return (
            <div className="text-right">
              <Harga harga={data.jumlah * data.temphargamodal} />
            </div>
          );
        case "totalharga-jual":
          return (
            <div className="text-right">
              <Harga harga={data.jumlah * data.harga} />
            </div>
          );
        case "profit":
          return (
            <div className="text-right">
              <Harga harga={data.harga - data.temphargamodal} />
            </div>
          );
        case "provitmarginpersen":
          return (
            Math.round(
              ((data.harga - data.temphargamodal) / data.harga) * 100 * 100,
            ) / 100
          );
        case "persenprovit":
          return (
            Math.round(
              countPercentProvit(data.temphargamodal, data.harga) * 100,
            ) / 100 || ""
          );
        case "totalprofit":
          return (
            <div className="text-right">
              <Harga
                harga={
                  data.jumlah * data.harga - data.jumlah * data.temphargamodal
                }
              />
            </div>
          );
        case "showmerek":
          return (
            <MySwitch
              autoSave
              apiEndpoint={KERANJANG_PROYEK_ENDPOINT_v1}
              fieldSwitch="showmerek"
              id={idKeranjangProyek}
              isDisabled={!isAuthorized}
              isSelected={showMerek}
              referenceData={[parentData]}
            ></MySwitch>
          );
        case "showtipe":
          return (
            <MySwitch
              autoSave
              apiEndpoint={KERANJANG_PROYEK_ENDPOINT_v1}
              fieldSwitch="showtipe"
              id={idKeranjangProyek}
              isDisabled={!isAuthorized}
              isSelected={showTipe}
              referenceData={[parentData]}
            ></MySwitch>
          );
        case "aksi":
          return (
            <div className="relative flex items-center gap-2">
              {isAuthorized && (
                <Tooltip content="Edit">
                  <span
                    onClick={() => onEdit(data)}
                    className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  >
                    <EditIcon />
                  </span>
                </Tooltip>
              )}
              {isAuthorized && (
                <Tooltip color="danger" variant="solid" content="Delete">
                  <span
                    onClick={() => onDelete(idKeranjangProyek)}
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
    },
    [user],
  );
  const subTotalHarga = items.reduce(
    (total, item) => total + (item.jumlah || 0) * (item.harga || 0),
    0,
  );
  const subTotalModal = items.reduce(
    (total, item) => total + (item.jumlah || 0) * (item.temphargamodal || 0),
    0,
  );
  const subTotalProfit = items.reduce(
    (total, item) =>
      total +
      (item.jumlah || 0) * ((item.harga || 0) - (item.temphargamodal || 0)),
    0,
  );

  return (
    <div className="bg-white p-3 rounded-lg">
      <div>{title}</div>
      <div className="flex gap-2">
        <ConditionalComponent
          condition={isAuthorized}
          component={
            <TambahProdukPenawaran
              isHighRole={isHighRole}
              idProyek={idProyek}
              instalasi={instalasi}
              mutateKeranjang={mutateKeranjang}
              versi={versi}
              user={user}
            />
          }
        />
        <div className="flex flex-col gap-2">
          {/* <ScrollShadow orientation="vertical" className="w-3/4 h-100"> */}
          <Table
            classNames={tableClassNames}
            key={tableKey}
            isStriped
            isCompact
            className={`${className} max-h-3/4`}
            topContent={topContent}
            bottomContentPlacement="outside"
            bottomContent={<></>}
            aria-label={`Example table with custom cells`}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  align={column.key === "aksi" ? "center" : "start"}
                >
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={items} emptyContent={"Kosong"}>
              {(item) => (
                <TableRow key={item.id_keranjangproyek}>
                  {(columnKey) => (
                    <TableCell className="whitespace-nowrap">
                      {renderCell(item, columnKey)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* </ScrollShadow> */}
          <TableSummary>
            <div className="bg-white p-2 rounded-lg shadow-md">
              <div>
                <Harga label={summaryLabel} harga={subTotalHarga} />
              </div>
              {isHighRole && (
                <>
                  <div>
                    <Harga
                      label="Sub Total Harga Modal :"
                      harga={subTotalModal}
                    />
                  </div>
                  <div>
                    <Harga
                      label={`Sub Total Provit : ( ${countPercentProvit(subTotalModal, subTotalHarga).toFixed(2)}% )`}
                      harga={subTotalProfit}
                    />
                  </div>
                </>
              )}
            </div>
          </TableSummary>
        </div>
      </div>
    </div>
  );
};

const TableSummary = ({ children }) => (
  <div className="flex justify-end">
    <div className="text-right sticky right-3">{children}</div>
  </div>
);
