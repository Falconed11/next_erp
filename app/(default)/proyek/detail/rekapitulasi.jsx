import { Children, useState } from "react";
import Harga from "@/components/harga";
import { countPercentProvit, countRecapitulation } from "@/app/utils/formula";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { NumberInput } from "@heroui/react";
import { getApiPath } from "@/app/utils/apiconfig";
import { RecapTable } from "./rekap";

const api_path = getApiPath();

export default function Rekapitulasi({
  peralatan,
  instalasi,
  total,
  rekapitulasiPeralatan,
  rekapitulasiInstalasi,
  rekapitulasiTotal,
  rekapitulasi,
  id
}) {
  const [formPeralatan, setFormPeralatan] = useState({});
  const [formInstalasi, setFormInstalasi] = useState({});
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const editButtonPress = () => {
    setFormPeralatan({
      ...formPeralatan,
      modal: rekapitulasiPeralatan.modal,
      jual: rekapitulasiPeralatan.jual,
      maksDiskon: rekapitulasiPeralatan.maksDiskon,
      maksDiskonPersen: rekapitulasiPeralatan.maksDiskonPersen,
      diskon: rekapitulasi.diskon,
      pajakpersen: rekapitulasi.pajak,
    });
    setFormInstalasi({
      ...formInstalasi,
      modal: rekapInstalasi.modal,
      jual: rekapInstalasi.jual,
      maksDiskon: rekapInstalasi.maksDiskon,
      maksDiskonPersen: rekapInstalasi.maksDiskonPersen,
      diskon: rekapitulasi.diskoninstalasi,
      pajakpersen: 0,
    });
    onOpen();
  };
  const handleButtonSimpan = async (
    diskon,
    diskoninstalasi,
    pajak,
    rekapitulasi,
    onClose
  ) => {
    console.log(rekapitulasi);
    const isPresent = rekapitulasi.id;
    const method = isPresent ? "PUT" : "POST";
    console.log(method);
    try {
      const res = await fetch(`${api_path}rekapitulasiproyek`, {
        method,
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          ...(isPresent
            ? { id: rekapitulasi.id }
            : { id_proyek: rekapitulasi.id_proyek, versi: rekapitulasi.versi }),
          diskon,
          diskoninstalasi,
          pajak,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Handle specific error messages if available
        const message = json.message || `Error ${res.status}`;
        alert(message);
        return;
      }
      onClose();
      // return alert(json.message);
    } catch (err) {
      alert("Network error or server not responding");
      console.error(err);
    }
  };
  // const rekapPeralatan = countRecapitulation(
  //   peralatan,
  //   rekapitulasi.diskon,
  //   rekapitulasi.pajak
  // );
  // const rekapInstalasi = countRecapitulation(
  //   instalasi,
  //   rekapitulasi.diskoninstalasi,
  //   0
  // );
  // const createRecapTable = (rekap, diskon, pajak) => {
  //   const tableData = [
  //     { key: "Sub Total Modal", val: rekap.modal, info: null },
  //     { key: "Sub Total Harga", val: rekap.jual, info: null },
  //     {
  //       key: "Maks Diskon",
  //       val: rekap.maksDiskon,
  //       info: rekap.maksDiskonPersen,
  //     },
  //   ];
  //   if (diskon)
  //     tableData.push(
  //       {
  //         key: "Diskon",
  //         val: diskon,
  //         info: rekap.diskonPersen,
  //       },
  //       {
  //         key: "Harga Setelah Diskon",
  //         val: rekap.hargaDiskon,
  //         info: null,
  //       }
  //     );
  //   if (pajak)
  //     tableData.push(
  //       { key: "Pajak", val: rekap.pajak, info: pajak },
  //       { key: "Harga Setelah Pajak", val: rekap.hargaPajak, info: null }
  //     );
  //   tableData.push({
  //     key: "Estimasi Provit",
  //     val: rekap.provit,
  //     info: rekap.provitPersen,
  //   });
  //   return tableData;
  // };
  // const dataTabelPeralatan = createRecapTable(
  //   rekapPeralatan,
  //   rekapitulasi.diskon,
  //   rekapitulasi.pajak
  // );
  // const dataTabelInstalasi = createRecapTable(
  //   rekapInstalasi,
  //   rekapitulasi.diskoninstalasi,
  //   0
  // );
  // const totalModal = rekapPeralatan.modal + rekapInstalasi.modal;
  // const totalJual = rekapPeralatan.jual + rekapInstalasi.jual;
  // const totalDiskon = rekapitulasi.diskon + rekapitulasi.diskoninstalasi;
  // const totalHargaDiskon = totalJual - totalDiskon;
  // const dataTabelTotal = [
  //   { key: "Harga Modal", val: totalModal },
  //   {
  //     key: "Harga Jual",
  //     val: totalJual,
  //   },
  // ];
  // if (totalDiskon)
  //   dataTabelTotal.push(
  //     {
  //       key: "Diskon",
  //       val: totalDiskon,
  //     },
  //     {
  //       key: "Harga Setelah Diskon",
  //       val: totalHargaDiskon,
  //     }
  //   );
  // if (rekapPeralatan.pajak)
  //   dataTabelTotal.push(
  //     {
  //       key: "Pajak Peralatan",
  //       val: rekapPeralatan.pajak,
  //     },
  //     {
  //       key: "Harga Setelah Pajak",
  //       val: totalJual + rekapPeralatan.pajak,
  //     }
  //   );
  // dataTabelTotal.push({
  //   key: "Estimasi Provit",
  //   val: rekapPeralatan.provit + rekapInstalasi.provit,
  //   info: countPercentProvit(totalModal, totalHargaDiskon).toFixed(2),
  // });
  // const jual = rekapPeralatan.jual + rekapInstalasi.jual;
  // const diskon = formInstalasi.diskon + formPeralatan.diskon || 0;
  // const hargaDiskon = jual - diskon;
  // const pajak =
  //   ((formPeralatan.jual - formPeralatan.diskon) * formPeralatan.pajakpersen) /
  //   100;
  // const hargaPajak = hargaDiskon + pajak;
  // const provit = hargaDiskon - totalModal;
  // const provitPersen = countPercentProvit(totalModal, hargaDiskon).toFixed(2);
  return (
    <>
      <div className="bg-white rounded-lg p-3 w- text-nowrap">
        <div>Rekapitulasi</div>
        <div className="flex gap-2">
          <RecapBody
            title="Peralatan"
            Children={<RecapTable tableData={peralatan} />}
          />
          <RecapBody
            title="Instalasi"
            Children={<RecapTable tableData={instalasi} />}
          />
        </div>
        <RecapBody
          title="Total"
          Children={<RecapTable tableData={total} />}
        />
        <div className="text-right">
          <Button color="primary" onPress={editButtonPress}>
            Edit
          </Button>
        </div>
      </div>
      {/* <Modal
        scrollBehavior="inside"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Rekapitulasi
              </ModalHeader>
              <ModalBody>
                <RekapHarga
                  title={"Peralatan"}
                  form={formPeralatan}
                  setForm={setFormPeralatan}
                />
                <RekapHarga
                  title={"Instalasi"}
                  form={formInstalasi}
                  setForm={setFormInstalasi}
                  disablePajak
                />
                <div className="font-bold">Total</div>
                <div>
                  Harga Modal : <Harga harga={totalModal} />
                </div>
                <div>
                  Harga Jual : <Harga harga={jual} />
                </div>
                <div>
                  Diskon : <Harga harga={diskon} />
                </div>
                <div>
                  Harga Setelah Diskon : <Harga harga={hargaDiskon} />
                </div>
                <div>
                  Pajak : <Harga harga={pajak} />
                </div>
                <div>
                  Harga Setelah Pajak : <Harga harga={hargaPajak} />
                </div>
                <div>
                  Provit : <Harga harga={provit} /> ({provitPersen}%)
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() =>
                    handleButtonSimpan(
                      formPeralatan.diskon,
                      formInstalasi.diskon,
                      formPeralatan.pajakpersen,
                      rekapitulasi,
                      onClose
                    )
                  }
                >
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal> */}
    </>
  );
}

const RecapBody = ({ title, Children }) => (
  <div>
    <div className="font-bold">{title}</div>
    <div className="pl-2">{Children}</div>
  </div>
);
