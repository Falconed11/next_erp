import { Button } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableSection,
  TableCell,
  User,
  Chip,
  Tooltip,
  ChipProps,
  getKeyValue,
  NumberInput,
  Spinner,
  Switch,
} from "@heroui/react";
import { CompanyHeader, PrintWithHeader } from "@/components/mycomponent";
import Harga from "@/components/harga";
import { useRef, useState, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { nominalToText } from "@/app/utils/number";
import { useClientFetch } from "@/app/utils/apiconfig";
import { getDateFId } from "@/app/utils/date";
import { invoice } from "@/app/utils/formatid";

export default function SuratJalan({ id_proyek, versi }) {
  const componentRef = useRef(null);
  const handlePrintInvoice = useReactToPrint({
    contentRef: componentRef,
    pageStyle: "p-10 block",
  });
  const keranjangPeralatan = useClientFetch(
    `keranjangproyek?id_proyek=${id_proyek}&instalasi=0&versi=${versi}`
  );
  const proyek = useClientFetch(`proyek?id=${id_proyek}`);
  const queries = { keranjangPeralatan, proyek };
  const renderCell = useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "no":
        return <div className="text-center">{cellValue}</div>;
      case "deskripsiitem":
        return (
          <>
            {data.keterangan ? data.keterangan : data.nama}{" "}
            {data.nmerek == "NN" || !data.showmerek ? "" : data.nmerek}{" "}
            {data.tipe == "NN" || !data.showtipe ? "" : data.tipe}
          </>
        );
      case "jumlah":
        return (
          <div className="grid grid-cols-2">
            <div className="text-right">{cellValue}</div>
            <div className="pl-1">{data.satuan}</div>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
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
  ];
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  for (const [name, data] of Object.entries(queries)) {
    if (data.error) return <div>Failed to load {name}</div>;
    if (data.isLoading) return <div>Loading {name}...</div>;
  }
  const selectedProyek = proyek.data[0];
  // if (session.status === "loading") return <>Session Loading ...</>;
  return (
    <>
      <Button
        color="primary"
        onPress={() => {
          onOpen();
        }}
      >
        Surat Jalan
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
              <ModalHeader className="flex flex-col gap-1">
                Surat Jalan
              </ModalHeader>
              <ModalBody>
                <div ref={componentRef} className="bg-white text-">
                  <PrintWithHeader
                    header={
                      <div>
                        <CompanyHeader
                          titleClassname="font-bold text-base"
                          sideTitle={
                            <div className="font-bold text-base text-right">
                              Surat Jalan
                            </div>
                          }
                          name={selectedProyek.namaperusahaan}
                          description={selectedProyek.deskripsiperusahaan}
                          address={selectedProyek.alamatperusahaan}
                          contact={selectedProyek.kontakperusahaan}
                        />
                        <div className="border-b border-black"></div>
                        <div className="grid grid-cols-2">
                          <div>
                            <div>Invoice kepada :</div>
                            <div>{selectedProyek.klien}</div>
                            <div>{selectedProyek.instansi}</div>
                          </div>
                          <div className="text-right">
                            <div>
                              No. Invoice :{" "}
                              {invoice(
                                selectedProyek.id_kustom,
                                new Date(selectedProyek.tanggal)
                              )}
                            </div>
                            <div>Tanggal : {getDateFId(new Date())}</div>
                            <div>No. PO : {selectedProyek.id_po}</div>
                          </div>
                        </div>
                        <div className="border-b border-black"></div>
                      </div>
                    }
                    body={
                      <Table
                        className={`m-0 p-0 border-b border-black overscroll-none`}
                        classNames={{
                          wrapper: "p-0 rounded-none gap-0 overscroll-none",
                          table:
                            "m-0 p-0 border-b border-black border-collapse rounded-none overscroll-none",
                          thead:
                            "rounded-none bg-transparent [&>tr:last-child]:hidden",
                          th: "border-y border-black text-black bg-transparent px-0 py-0 h-0",
                          td: "px-0 py-0 text-xs leading-none- align-top",
                          tr: "m-0 p-0",
                          base: "rounded-none shadow-none overscroll-none",
                        }}
                        aria-label="Example table with custom cells"
                        shadow="none"
                      >
                        <TableHeader columns={col}>
                          {(column) => (
                            <TableColumn
                              key={column.key}
                              align={
                                [
                                  "aksi",
                                  "no",
                                  "jumlah",
                                  "harga",
                                  "total",
                                ].includes(column.key)
                                  ? "center"
                                  : "start"
                              }
                              className={
                                {
                                  no: "w-[30px]",
                                  deskripsiitem: "w-1/2",
                                  jumlah: "w-1/10",
                                }[column.key]
                              }
                              // className={`${column.key === "no" ? "w-[30px]" : ""}`}
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
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Tutup
                </Button>
                <Button color="primary" onPress={handlePrintInvoice}>
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
