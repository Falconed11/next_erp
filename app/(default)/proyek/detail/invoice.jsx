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
import Image from "next/image";

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
  className,
}) {
  const pembayaranProyek = useClientFetch(
    `pembayaranProyek?id_proyek=${proyek.id}&asc=1`
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
                  className="bg-white text-black leading-none text-sm"
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
                          No. Invoice :{" "}
                          {invoice(proyek.id_kustom, new Date(proyek.tanggal))}
                        </div>
                        <div>
                          Tanggal : {getDateFId(new Date(proyek.tanggal))}
                        </div>
                        <div>No. PO : {proyek.id_po}</div>
                      </div>
                    </div>
                    <Table
                      className={`border border-black p-2`}
                      classNames={className}
                      aria-label="Example table with custom cells"
                      shadow="none"
                      isCompact
                      isStriped
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
                    <div className="flex flex-row pb-1 border-b border-black">
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
                              {rekapDiskon + rekapPajak ||
                              dataPembayaran.length ? (
                                <br />
                              ) : (
                                "Total"
                              )}
                            </div>
                            {rekapDiskon > 0 ? (
                              <>
                                <div>Diskon</div>
                                <div className="border-b border-black">
                                  Harga Setelah Diskon
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                            {rekapPajak > 0 ? (
                              <>
                                <div>Pajak ({rekapPajak}%)</div>
                                <div className="border-b border-black">
                                  Harga Setelah Pajak
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                            {dataPembayaran.length ? (
                              <>
                                {dataPembayaran.map((v, i) =>
                                  i ? (
                                    <br key={i} />
                                  ) : (
                                    <div key={i}>Uang Muka</div>
                                  )
                                )}
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
                                <div className="border-b border-black">
                                  {<Harga harga={kustomDiskon} />}
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                            {rekapPajak > 0 ? (
                              <>
                                <div>
                                  <Harga harga={pajakKustom} />
                                </div>
                                <div className="border-b border-black">
                                  <Harga harga={finalKustom} />
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                            {dataPembayaran.length ? (
                              <>
                                {dataPembayaran.map((v, i) => (
                                  <div key={i}>
                                    <Harga harga={v.nominal} />
                                  </div>
                                ))}
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
                      <div className="basis-2/4">
                        Pembayaran melalui : Rek. {dataPembayaran[0]?.nama_bank}{" "}
                        : {dataPembayaran[0]?.norekening}
                      </div>
                      <div className="basis-2/4">
                        An. {dataPembayaran[0]?.atasnama}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex">
                        <div className="basis-3/4 p-1 border border-black">
                          Catatan :
                        </div>
                      </div>
                      <div className="flex">
                        <div className="basis-3/4 p-1 border border-black">
                          Lorem ipsum dolor sit amet consectetur adipisicing
                          elit. Quae, architecto. Ipsa illum asperiores,
                          corrupti nostrum corporis mollitia. Id, aspernatur
                          dolorem nisi maiores sequi laborum animi, cupiditate
                          deleniti alias atque quidem.
                        </div>
                      </div>
                    </div>
                    {proyek.id_perusahaan == 1 ? (
                      <div>
                        <div>Belga Karya Semesta</div>
                        <Image
                          src="/sample_signature.png"
                          alt="signature"
                          width={200}
                          height={200}
                        />
                        <div className="underline">Aslkdn Kksladj Lksdj</div>
                      </div>
                    ) : (
                      <div>
                        <div>Satu Visi Teknikatama</div>
                        <Image
                          src="/sample_signature.png"
                          alt="signature"
                          width={200}
                          height={200}
                        />
                        <div className="underline">Aslkdn Kksladj Lksdj</div>
                      </div>
                    )}
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
