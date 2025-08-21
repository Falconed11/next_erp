import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Button,
  Checkbox,
  Chip,
  Input,
  Radio,
  RadioGroup,
  Tooltip,
} from "@heroui/react";
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
import { RecapTable } from "./rekap";

const api_path = getApiPath();

export default function Invoice({
  proyek,
  peralatan,
  instalasi,
  rekapTotal,
  compRekapPeralatan,
  compRekapInstalasi,
  compRekapTotal,
}) {
  const pembayaranProyek = useClientFetch(
    `pembayaranProyek?id_proyek=${proyek.id}&asc=1`
  );
  const componentRef = useRef(null);
  const handlePrintInvoice = useReactToPrint({
    contentRef: componentRef,
    pageStyle: `
    @media print {
      @page {
        @bottom-center {
        content: counter(page) " / " counter(pages);
        font-size: 12px;
        color: black;
      }
    }  
    `,
  });
  const [versi, setVersi] = useState(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  if (pembayaranProyek.error) return <div>failed to load keranjang proyek</div>;
  if (pembayaranProyek.isLoading) return <div>loading...</div>;

  const addRowNumber = (array) => array.map((v, i) => ({ ...v, no: i + 1 }));
  const dataPeralatan = addRowNumber(peralatan);
  const dataInstalasi = addRowNumber(instalasi);
  const dataPembayaran = pembayaranProyek.data;
  const lengthPembayaran = dataPembayaran.length;
  const dataPembayaranVersi = dataPembayaran.slice(0, versi + 1);
  const lengthPembayaranVersi = dataPembayaranVersi.length;
  const totalPembayaran = dataPembayaran.reduce(
    (acc, v, i) => acc + v.nominal,
    0
  );
  return (
    <>
      <Button
        isDisabled={!lengthPembayaran}
        onPress={() => {
          setVersi(lengthPembayaran - 1);
          onOpen();
        }}
        color="primary"
        className="mt-3"
      >
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
                {lengthPembayaran > 1 && (
                  <RadioGroup
                    label={"Pilih Versi :"}
                    orientation="horizontal"
                    value={versi}
                    onValueChange={setVersi}
                  >
                    {dataPembayaran.map((data, i) => (
                      <Radio value={i} key={i}>
                        {i == 0 ? "Uang Muka" : `Termin ${i + 1}`}
                      </Radio>
                    ))}
                  </RadioGroup>
                )}
                <div
                  ref={componentRef}
                  className="bg-white text-black leading-none"
                >
                  {/* <div className="print:fixed print:z-50 print:w-full print:-top-5"> */}
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th colSpan="2" className="border-b border-black py-2">
                          <div className="flex flex-row items-center">
                            <div className="flex-grow border-t border-black"></div>
                            <div className="mx-4 text-2xl font-bold">
                              Invoice
                            </div>
                            <div className="flex-grow border-t border-black"></div>
                          </div>
                        </th>
                      </tr>
                      <tr>
                        <td className="align-top w-1/2">
                          <div>Invoice kepada :</div>
                          <div>{proyek.klien}</div>
                          <div>{proyek.instansi}</div>
                        </td>
                        <td className="text-right w-1/2">
                          <div>
                            No. Invoice :{" "}
                            {invoice(
                              proyek.id_kustom,
                              new Date(proyek.tanggal)
                            )}
                          </div>
                          <div>
                            Tanggal :{" "}
                            {getDateFId(
                              new Date(dataPembayaran[versi]?.tanggal)
                            )}
                          </div>
                          <div>No. PO : {proyek.id_po}</div>
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="2">
                          <div className="flex flex-col gap-2 text-xs">
                            {/* Table */}
                            <div>
                              {peralatan.length ? (
                                <InvoiceTable
                                  title={"Peralatan"}
                                  data={dataPeralatan}
                                  compRecap={compRekapPeralatan}
                                />
                              ) : (
                                <></>
                              )}
                              {instalasi.length ? (
                                <InvoiceTable
                                  title={"Instalasi"}
                                  data={dataInstalasi}
                                  compRecap={compRekapInstalasi}
                                />
                              ) : (
                                <></>
                              )}
                            </div>
                            {/* Rekap */}
                            {/* <div>{compRekapTotal}</div> */}
                            <div className="grid grid-cols-2">
                              <div></div>
                              <RecapTable
                                tableData={[
                                  ...(dataPembayaran[0].nominal <
                                  rekapTotal.hargaPajak
                                    ? [
                                        {
                                          key: "",
                                          val: rekapTotal.hargaPajak,
                                          classNames:
                                            lengthPembayaranVersi == 1 &&
                                            "border-b border-black",
                                        },
                                      ]
                                    : []),
                                  ...dataPembayaranVersi.map((v, i) => ({
                                    ...(i == lengthPembayaranVersi - 1
                                      ? {
                                          key: "Grand Total",
                                          classNames: "font-bold",
                                        }
                                      : {
                                          key:
                                            i == 0
                                              ? "Uang Muka"
                                              : `Termin ${i + 1}`,
                                          classNames:
                                            i + 1 ==
                                              lengthPembayaranVersi - 1 &&
                                            "border-b border-black",
                                        }),
                                    val: v.nominal,
                                  })),
                                ]}
                              />
                            </div>
                            <div className="font-bold border-b border-black">
                              ***{" "}
                              {nominalToText(
                                dataPembayaranVersi.at(-1)?.nominal
                              )}
                            </div>
                            <div className="flex">
                              <div className="basis-2/4">
                                Pembayaran melalui : Rek.{" "}
                                {dataPembayaranVersi.at(-1)?.nama_bank} :{" "}
                                {dataPembayaranVersi.at(-1)?.norekening}
                              </div>
                              <div className="basis-2/4">
                                An. {dataPembayaranVersi.at(-1)?.atasnama}
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
                                  <div>
                                    Pembayaran harus dianggap lunas apabila cek,
                                    giro atau alat pembayaran lainnnya telah
                                    berhasil di clearing oleh bank kami.
                                  </div>
                                  <div>
                                    Barang yang sudah di beli tidak dapat
                                    dikembalikan atau di tukar.
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* {proyek.id_perusahaan == 1 ? (
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
                    )} */}
                          </div>
                          <div className="no-break">
                            <div className="bg-black h-0.5 my-2"></div>
                            {proyek.namaperusahaan == "bks" ? (
                              <BKSHeader />
                            ) : (
                              <SVTHeader />
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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

const InvoiceTable = ({ title, data, compRecap }) => {
  const renderCell = React.useCallback((data, columnKey) => {
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
    // { key: "satuan" },
    {
      key: "harga",
      label: "Harga",
    },
    {
      key: "total",
      label: "Total",
    },
  ];
  return (
    <>
      <Table
        className={`m-0 p-0 border border-black`}
        classNames={{
          wrapper: "p-1 rounded-none",
          table: "m-0 p-0 border-b border-black border-collapse rounded-none",
          thead:
            "border border-black rounded-none bg-transparent [&>tr:last-child]:hidden",
          th: "border border-black text-black bg-transparent px-1 py-0",
          td: "border-l border-r border-black px-1 py-0 text-sm align-top",
          tr: "m-0 p-0",
          base: "rounded-none shadow-none",
        }}
        aria-label="Example table with custom cells"
        shadow="none"
        isCompact
        topContent={title}
        bottomContent={compRecap}
      >
        <TableHeader columns={col}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={["aksi", "no"].includes(column.key) ? "center" : "start"}
              className={
                { no: "w-[30px]", deskripsiitem: "w-1/2", jumlah: "w-1/10" }[
                  column.key
                ]
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
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};
