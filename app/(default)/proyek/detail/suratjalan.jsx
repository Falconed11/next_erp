import { Button } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
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
import { useRef, useState, useCallback, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { nominalToText } from "@/app/utils/number";
import { useClientFetch, getApiPath } from "@/app/utils/apiconfig";
const apiPath = getApiPath();
import { getDateFId, getDate } from "@/app/utils/date";
import { invoice } from "@/app/utils/formatid";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function SuratJalan({ id_proyek, versi, isAuthorized }) {
  const componentRef = useRef(null);
  const handlePrintInvoice = useReactToPrint({
    contentRef: componentRef,
    pageStyle: `
      @page {
        @bottom-center {
        content: counter(page) " / " counter(pages);
        vertical-align: top;
        font-size: 12px;
        color: black;
      }
      }
      @media print {
        thead {
          display: table-header-group;
        }
      }
      `,
  });
  const [form, setForm] = useState({});
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
            <div className="pl-1 text-left">{data.satuan}</div>
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
  const dataPeralatan = useMemo(() => {
    if (!keranjangPeralatan?.data) return [];
    return [...keranjangPeralatan.data].map((produk, i) => ({
      ...produk,
      no: i + 1,
    }));
  }, [keranjangPeralatan?.data]);
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
          setForm({
            alamatsuratjalan: selectedProyek.alamatsuratjalan,
            tanggalsuratjalan: selectedProyek.tanggalsuratjalan,
          });
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
                {isAuthorized && (
                  <>
                    <div className="flex gap-2">
                      <Textarea
                        type="text"
                        variant="bordered"
                        className=""
                        label="Alamat"
                        placeholder="Masukkan alamat!"
                        value={form.alamatsuratjalan || ""}
                        onValueChange={(v) =>
                          setForm({ ...form, alamatsuratjalan: v })
                        }
                      />
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div>Tanggal</div>
                        <DatePicker
                          className="bg-white"
                          placeholderText="Pilih tanggal"
                          dateFormat="dd/MM/yyyy"
                          selected={
                            form.tanggalsuratjalan
                              ? new Date(form.tanggalsuratjalan)
                              : null
                          }
                          onChange={(v) =>
                            setForm({ ...form, tanggalsuratjalan: getDate(v) })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <div>
                        <Button
                          color="primary"
                          onPress={() => {
                            setForm({
                              alamatsuratjalan: selectedProyek.alamatsuratjalan,
                              tanggalsuratjalan:
                                selectedProyek.tanggalsuratjalan,
                            });
                          }}
                        >
                          Refresh
                        </Button>
                      </div>
                      <div>
                        <Button
                          color="primary"
                          onPress={async () => {
                            const res = await fetch(`${apiPath}proyek`, {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                // 'Content-Type': 'application/x-www-form-urlencoded',
                              },
                              body: JSON.stringify({ ...form, id: id_proyek }),
                            });
                            const json = await res.json();
                            if (res.status == 400) return alert(json.message);
                            proyek.mutate();
                          }}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  </>
                )}
                <div ref={componentRef} className="bg-white text-xs">
                  <PrintWithHeader
                    header={
                      <div className="text-xs">
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
                        {/* <div className="border-b border-black"></div> */}
                        <div className="grid grid-cols-2">
                          <div>
                            <div>Ditujukan kepada :</div>
                            <div>{selectedProyek.klien}</div>
                            <div>{selectedProyek.instansi}</div>
                            {selectedProyek.alamatsuratjalan && (
                              <div>{selectedProyek.alamatsuratjalan}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div>
                              No. Invoice :{" "}
                              {invoice(
                                selectedProyek.id_penawaran,
                                new Date(selectedProyek.tanggal)
                              )}
                            </div>
                            <div>
                              Tanggal :{" "}
                              {getDateFId(
                                new Date(selectedProyek.tanggalsuratjalan)
                              )}
                            </div>
                            <div>No. PO : {selectedProyek.id_po}</div>
                          </div>
                        </div>
                        {/* <div className="border-b border-black"></div> */}
                      </div>
                    }
                    body={
                      <>
                        <Table
                          className={`m-0 mt-2 p-0 border-b- border-black overscroll-none`}
                          classNames={{
                            wrapper: "p-0 rounded-none gap-0 overscroll-none",
                            table:
                              "m-0 p-0 border-b- border-black border-collapse rounded-none overscroll-none",
                            thead:
                              "rounded-none bg-transparent [&>tr:last-child]:hidden",
                            th: "border-y- border-black text-black bg-transparent px-0 py-0 h-0",
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
                                    deskripsiitem: "w-1/2-",
                                    jumlah: "w-2/10",
                                  }[column.key]
                                }
                                // className={`${column.key === "no" ? "w-[30px]" : ""}`}
                              >
                                {column.label}
                              </TableColumn>
                            )}
                          </TableHeader>
                          <TableBody items={dataPeralatan}>
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
                        <div className="grid grid-cols-4 mt-5">
                          <div className="text-center">Diterima oleh</div>
                          <div className="text-center"></div>
                          <div className="text-center"></div>
                          <div className="text-center">Gudang</div>
                        </div>
                        <br />
                        <br />
                        <br />
                        <div className="grid grid-cols-4">
                          <div className="grid grid-cols-2">
                            <div>(</div>
                            <div className="text-right">)</div>
                          </div>
                          <div className="text-center"></div>
                          <div className="text-center"></div>
                          <div className="grid grid-cols-2">
                            <div>(</div>
                            <div className="text-right">)</div>
                          </div>
                        </div>
                        <div className="flex mt-5">
                          <div className="border-y border-black">
                            Barang masih menjadi milik{" "}
                            {selectedProyek.namaperusahaan} selama pembelian
                            belum lunas
                          </div>
                        </div>
                      </>
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    setForm({});
                    onClose();
                  }}
                >
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
