import { RadioGroup, Radio } from "@heroui/react";
import { getDateFId } from "@/app/utils/date";
import { CompanyHeader } from "@/components/mycomponent";
import Harga from "@/components/harga";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { nominalToText } from "@/app/utils/number";
import { useClientFetch } from "@/app/utils/apiconfig";

export default function Kwitansi({ proyek, nilaiProyek }) {
  const componentRef = useRef(null);
  const handlePrintInvoice = useReactToPrint({
    contentRef: componentRef,
    pageStyle: "p-10 block",
  });
  const [versi, setVersi] = useState(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const pembayaranProyek = useClientFetch(
    `pembayaranProyek?id_proyek=${proyek.id}&asc=1`
  );
  if (pembayaranProyek.error) return <div>failed to load keranjang proyek</div>;
  if (pembayaranProyek.isLoading) return <div>loading...</div>;
  const pembayaran = pembayaranProyek.data;
  const lengthPembayaran = pembayaran.length;
  return (
    <>
      <Button
        isDisabled={!lengthPembayaran}
        onPress={() => {
          setVersi(lengthPembayaran - 1);
          onOpen();
        }}
        className=""
        color="primary"
      >
        Kwitansi
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
                Kwitansi
              </ModalHeader>
              <ModalBody>
                {lengthPembayaran > 1 && (
                  <RadioGroup
                    label={"Pilih Versi :"}
                    orientation="horizontal"
                    value={versi}
                    onValueChange={setVersi}
                  >
                    {pembayaran.map((data, i) => (
                      <Radio value={i} key={i}>
                        {i == 0 ? "Uang Muka" : `Termin ${i + 1}`}
                      </Radio>
                    ))}
                  </RadioGroup>
                )}
                <div ref={componentRef} className="bg-white text-">
                  <div className="flex">
                    <div className="text-xs basis-3/4">
                      <CompanyHeader
                        titleClassname={"font-bold text-xl"}
                        name={proyek.namaperusahaan}
                        description={proyek.deskripsiperusahaan}
                        address={proyek.alamatperusahaan}
                        contact={proyek.kontakperusahaan}
                      />
                    </div>
                    <div className="font-bold text-center basis-1/4">
                      <div className="text-xl">Kwitansi</div>
                      <div>
                        No :{" "}
                        <span className="border border-black px-1">
                          {pembayaran[versi]?.status == 1 &&
                            pembayaran[versi]?.id_second?.split("-")[1]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-y border-black text-center">
                    Pembayaran
                  </div>
                  <div className="pl-3 border-b border-black">
                    {[
                      {
                        key: "Telah Terima Dari",
                        value: pembayaran[versi]?.pembayar || proyek.instansi,
                      },
                      {
                        key: "Uang Sebanyak",
                        value: nominalToText(pembayaran[versi].nominal),
                      },
                      {
                        key: "Untuk Pembayaran",
                        value: `${
                          pembayaran[versi]?.untukpembayaran || proyek.nama
                        } ${
                          pembayaran[0].nominal < nilaiProyek
                            ? `( ${versi == 0 ? "Uang Muka / " : ""}Termin ${
                                versi + 1
                              } )`
                            : ""
                        }`,
                      },
                    ].map((data, i) => (
                      <div key={i} className="flex text-sm">
                        <div className="basis-1/5">{data.key}</div>
                        <div className="px-1 text-center">:</div>
                        <div className="basis-4/5 text-justify">
                          {data.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <div className="content-center- h-full p-3">
                      Terbilang : Rp.{" "}
                      <Harga harga={pembayaran[versi].nominal} />
                      ,00
                    </div>
                    <div className="text-right">
                      <br />
                      <div className="grid grid-cols-4">
                        <div></div>
                        <div className="text-center col-span-3">
                          Yogyakarta,{" "}
                          {getDateFId(new Date(pembayaran[versi].tanggal))}
                        </div>
                      </div>
                      <br />
                      <br />
                      <br />
                      <div className="grid grid-cols-4">
                        <div></div>
                        <div className="col-span-3 text-center">
                          <div className="w-1/2 mx-auto">
                            {pembayaran[versi]?.picKwitansi}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Tutup
                </Button>
                <Button
                  color="primary"
                  isDisabled={!pembayaran[versi]?.status}
                  onPress={handlePrintInvoice}
                >
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
