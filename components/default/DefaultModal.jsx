import { updateForm } from "@/app/utils/tools";
import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

export default function DefaultModal({
  data = { mutate: () => {} },
  isOpen,
  onOpenChange,
  form,
  setForm,
  onSave,
  name,
  id_karyawan,
  extraFields,
  disableNama = false,
}) {
  const saveButtonPress = async (onClose) => {
    const res = await onSave({
      ...form,
      lastid_karyawan: id_karyawan,
      ...(form.method == "POST"
        ? { authorid_karyawan: id_karyawan, created_by: id_karyawan }
        : { updated_by: id_karyawan }),
    });
    const json = await res.json();
    if (!res.ok) return alert(json.message);
    data.mutate();
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {form.title} {name}
            </ModalHeader>
            <ModalBody>
              {!disableNama && (
                <Input
                  isRequired
                  type="text"
                  variant="bordered"
                  label={name}
                  placeholder={`Masukkan nama ${name}!`}
                  value={form.nama}
                  onValueChange={(val) => updateForm(setForm, { nama: val })}
                />
              )}
              <Input
                type="text"
                variant="bordered"
                label={"Keterangan"}
                placeholder={`Masukkan keterangan!`}
                value={form.keterangan}
                onValueChange={(val) =>
                  updateForm(setForm, { keterangan: val })
                }
              />
              {extraFields && extraFields(form, setForm)}
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
}
