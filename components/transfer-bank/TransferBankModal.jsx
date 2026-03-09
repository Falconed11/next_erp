import { getDate } from "@/app/utils/date";
import { renderQueryStates } from "@/app/utils/tools";
import SelectMetodePembayaran from "@/components/metode-pembayaran/SelectMetodePembayaran";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Textarea,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TransferBankModal = ({
  isOpen,
  onOpenChange,
  form,
  setForm,
  onSave,
  mutate,
}) => {
  const session = useSession();
  const sessUser = session?.data?.user;
  const saveButtonPress = async (onClose) => {
    const res = await onSave(form, sessUser?.id_karyawan);
    const json = await res.json();
    if (!res.ok) return alert(json.message);
    mutate();
    onClose();
  };
  const QueryState = renderQueryStates({}, session);
  if (QueryState) return QueryState;
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {form.title} Transfer Bank
            </ModalHeader>
            <ModalBody>
              <TransferBankForm form={form} setForm={setForm} />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Batal
              </Button>
              <Button color="primary" onPress={() => saveButtonPress(onClose)}>
                Simpan
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const TransferBankForm = ({ form, setForm }) => {
  return (
    <>
      {/* date picker */}
      <div className="bg-gray-100 p-3 rounded-lg w-fit z-40">
        <div>Tanggal Transfer</div>
        <DatePicker
          className="bg-white rounded px-1"
          placeholderText="Pilih tanggal"
          dateFormat="dd/MM/yyyy"
          selected={new Date(form.tanggal)}
          onChange={(v) =>
            setForm({
              ...form,
              tanggal: getDate(v),
            })
          }
        />
        <Button
          onPress={() => {
            const now = new Date();
            setForm({
              ...form,
              tanggal: getDate(now),
            });
          }}
          className="ml-2"
          size="sm"
          color="primary"
        >
          Sekarang
        </Button>
      </div>
      <SelectMetodePembayaran
        form={form}
        setForm={setForm}
        fieldName="id_metode_pembayaran_asal"
        label="Asal"
      />
      <SelectMetodePembayaran
        form={form}
        setForm={setForm}
        fieldName="id_metode_pembayaran_tujuan"
        label="Tujuan"
      />
      <NumberInput
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        variant="bordered"
        label="Nominal"
        placeholder="Masukkan nominal!"
        value={form.nominal}
        onValueChange={(val) => setForm({ ...form, nominal: val })}
      />
      <Textarea
        variant="bordered"
        label="Keterangan"
        labelPlacement="inside"
        placeholder="Masukkan keterangan! (Opsional)"
        value={form.keterangan}
        onValueChange={(val) => setForm({ ...form, keterangan: val })}
      />
    </>
  );
};

export { TransferBankModal, TransferBankForm };
