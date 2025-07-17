import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button, Checkbox, Chip, Input, Tooltip } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  getApiPath,
  useClientFetch,
  useClientFetchNoInterval,
} from "@/app/utils/apiconfig";
import { invoice } from "@/app/utils/formatid";
import { getDateFId } from "@/app/utils/date";
import { nominalToText } from "@/app/utils/number";
import { BKSHeader, SVTHeader } from "@/components/mycomponent";
import { EditIcon, DeleteIcon } from "@/components/icon";
import Harga from "@/components/harga";

const api_path = getApiPath();

export default function Invoice({
  proyek,
  data,
  finalKustom,
  rekapDiskon,
  rekapPajak,
  totalKustom,
  kustomDiskon,
  pajakKustom,
}) {
  const pembayaranProyek = useClientFetch(
    `pembayaranProyek?id_proyek=${proyek.id}`
  );
  const componentRef = useRef(null);
  const handlePrintInvoice = useReactToPrint({
    contentRef: componentRef,
    pageStyle: "p-10 block",
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "deskripsiitem":
        return (
          <>
            {data.keterangan ? data.keterangan : data.nama}{" "}
            {data.nmerek == "NN" || !data.showmerek ? "" : data.nmerek}{" "}
            {data.tipe == "NN" || !data.showtipe ? "" : data.tipe}
          </>
        );
      case "jumlah":
        return <div className="text-right">{cellValue}</div>;
      case "total":
        return (
          <div className="text-right">
            <Harga harga={data.jumlah * data.harga} />
          </div>
        );
      case "harga":
        return (
          <div className="text-right">
            <Harga harga={data.harga} />
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  if (pembayaranProyek.error) return <div>failed to load keranjang proyek</div>;
  if (pembayaranProyek.isLoading) return <div>loading...</div>;
  const col = [
    {
      key: "no",
      label: "#",
    },
    {
      key: "deskripsiitem",
      label: "Deskripsi Item",
    },
    {
      key: "jumlah",
      label: "Jumlah",
    },
    { key: "satuan" },
    {
      key: "harga",
      label: "Harga",
    },
    {
      key: "total",
      label: "Total",
    },
  ];
  const dataPembayaran = pembayaranProyek.data;
  const totalPembayaran = dataPembayaran.reduce(
    (acc, v, i) => acc + v.nominal,
    0
  );
  const total = finalKustom - totalPembayaran;
  return (
    <>
      <Button onPress={onOpen} color="primary" className="mt-3">
        Invoice
      </Button>
      <Modal
        scrollBehavior="inside"
        size="4xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Invoice</ModalHeader>
              <ModalBody>
                <div
                  ref={componentRef}
                  className="bg-white text-black leading-none"
                >
                  <div className="flex flex-row items-center">
                    <div className="flex flex-col">
                      {proyek.namaperusahaan == "bks" ? (
                        <BKSHeader />
                      ) : (
                        <SVTHeader />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row items-center">
                    <div className="basis-1/2 bg-sky-500 h-2"></div>
                    <div className="basis-1/4 text-2xl font-bold text-center inline-block align-middle items-center">
                      Invoice
                    </div>
                    <div className="basis-1/4 bg-sky-500 h-2"></div>
                  </div>
                  {/* Table */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row">
                      <div className="basis-1/2">
                        <div>Invoice kepada :</div>
                        <div>{proyek.klien}</div>
                        <div>{proyek.instansi}</div>
                      </div>
                      <div className="basis-1/2 text-end">
                        <div>
                          Id :{" "}
                          {invoice(
                            proyek.id_penawaran,
                            new Date(proyek.tanggal_penawaran)
                          )}
                        </div>
                        <div>
                          Tanggal :{" "}
                          {getDateFId(new Date(proyek.tanggal_penawaran))}
                        </div>
                      </div>
                    </div>
                    <Table
                      className="border"
                      aria-label="Example table with custom cells"
                      shadow="none"
                      isCompact
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
                      <TableBody items={data}>
                        {(item) => (
                          <TableRow key={item.no}>
                            {(columnKey) => (
                              <TableCell>
                                {renderCell(item, columnKey)}
                              </TableCell>
                            )}
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    {/* Rekap */}
                    <div className="flex flex-row">
                      <div className="basis-2/4 content-end">
                        {`***   `}
                        {nominalToText(total)}
                      </div>
                      <div className="basis-2/4 pl-3">
                        <div className="flex">
                          <div className="basis-1/2">
                            <div
                              className={
                                rekapDiskon + rekapPajak &&
                                dataPembayaran.length
                                  ? ""
                                  : "font-bold"
                              }
                            >
                              {rekapDiskon + rekapPajak || dataPembayaran.length
                                ? "Sub"
                                : "Total"}
                            </div>
                            {rekapDiskon > 0 ? (
                              <>
                                <div>Diskon</div>
                                <div>Harga Setelah Diskon</div>
                              </>
                            ) : (
                              <></>
                            )}
                            {rekapPajak > 0 ? (
                              <>
                                <div>Pajak ({rekapPajak}%)</div>
                                <div>Harga Setelah Pajak</div>
                              </>
                            ) : (
                              <></>
                            )}
                            {dataPembayaran.length ? (
                              <>
                                <div>Uang Muka</div>
                                <div className="font-bold">TOTAL</div>
                              </>
                            ) : (
                              <></>
                            )}
                          </div>
                          <div className="text-right basis-1/2">
                            <div className="font-bold">
                              <Harga harga={totalKustom} />
                            </div>
                            {rekapDiskon > 0 ? (
                              <>
                                <div>{<Harga harga={rekapDiskon} />}</div>
                                <div>{<Harga harga={kustomDiskon} />}</div>
                              </>
                            ) : (
                              <></>
                            )}
                            {rekapPajak > 0 ? (
                              <>
                                <div>
                                  <Harga harga={pajakKustom} />
                                </div>
                                <div>
                                  <Harga harga={finalKustom} />
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                            {dataPembayaran.length ? (
                              <>
                                <div>
                                  <Harga harga={dataPembayaran[0].nominal} />
                                </div>
                                <div className="font-bold">
                                  <Harga harga={total} />
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row">
                      <div className="basis-2/4">Pembayaran melalui</div>
                      <div className="basis-2/4">An.</div>
                    </div>
                    <div className="flex">
                      <div className="basis-3/4 border border-black">
                        Catatan :
                      </div>
                    </div>
                    <div>
                      {proyek.id_perusahaan == 1
                        ? "Belga Karya Semesta"
                        : "Satu Visi Teknikatama"}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button onPress={handlePrintInvoice} color="primary">
                  Cetak
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
