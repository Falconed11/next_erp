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
  idProyek,
  versi,
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
      modal: rekapitulasiInstalasi.modal,
      jual: rekapitulasiInstalasi.jual,
      maksDiskon: rekapitulasiInstalasi.maksDiskon,
      maksDiskonPersen: rekapitulasiInstalasi.maksDiskonPersen,
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
    const isPresent = rekapitulasi.id;
    const method = isPresent ? "PUT" : "POST";
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
            : { id_proyek: idProyek, versi }),
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
  const modal = rekapitulasiTotal.modal
  const jual = rekapitulasiTotal.jual;
  const diskon = formInstalasi.diskon + formPeralatan.diskon || 0;
  const hargaDiskon = jual - diskon;
  const pajak =
    ((formPeralatan.jual - formPeralatan.diskon) * formPeralatan.pajakpersen) /
    100;
  const hargaPajak = hargaDiskon + pajak;
  const provit = hargaDiskon - modal;
  const provitPersen = countPercentProvit(modal, hargaDiskon).toFixed(2);
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
      <Modal
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
                  Harga Modal : <Harga harga={modal} />
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
      </Modal>
    </>
  );
}

const RecapBody = ({ title, Children }) => (
  <div>
    <div className="font-bold">{title}</div>
    <div className="pl-2">{Children}</div>
  </div>
);

const RekapHarga = ({ title, form, setForm, disablePajak }) => {
  const hargaDiskon = form.jual - form.diskon;
  const pajak = (hargaDiskon * form.pajakpersen) / 100;
  const totalHarga = hargaDiskon + pajak;
  return (
    <>
      <div className="font-bold">{title}</div>
      <div>
        Harga Modal : <Harga harga={form.modal} />
      </div>
      <div>
        Harga Jual : <Harga harga={form.jual} />
      </div>
      <div>
        Maks. Diskon : <Harga harga={form.maksDiskon} /> (
        {form.maksDiskonPersen}%)
      </div>
      <NumberInput
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        isInvalid={form.diskon > form.maksDiskon ? true : false}
        errorMessage={
          form.diskon > form.maksDiskon ? "Diskon melebihi batas" : undefined
        }
        value={form.diskon}
        label="Diskon"
        placeholder="Masukkan diskon!"
        endContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">
              ({((form.diskon / form.jual) * 100).toFixed(2)}
              %)
            </span>
          </div>
        }
        onValueChange={(v) => {
          setForm({
            ...form,
            diskon: v,
          });
        }}
      />
      <NumberInput
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        value={hargaDiskon}
        label="Harga Setelah Diskon"
        placeholder="Masukkan harga diskon!"
        endContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">
              <Harga harga={hargaDiskon} />
            </span>
          </div>
        }
        onValueChange={(v) => {
          setForm({
            ...form,
            diskon: form.jual - v,
          });
        }}
      />
      {disablePajak ? (
        <></>
      ) : (
        <NumberInput
          hideStepper
          isWheelDisabled
          formatOptions={{
            useGrouping: false,
          }}
          value={form.pajakpersen}
          label="Pajak (%)"
          placeholder="Masukkan pajak!"
          endContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">
                <Harga harga={pajak} />
              </span>
            </div>
          }
          onValueChange={(v) =>
            setForm({
              ...form,
              pajakpersen: v,
            })
          }
        />
      )}
      <div>
        Total Harga {title}: <Harga harga={totalHarga} />
      </div>
    </>
  );
};