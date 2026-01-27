import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

export default function DefaultModal({
  data,
  isOpen,
  onOpenChange,
  form,
  setForm,
  onSave,
  name,
  id_karyawan,
}) {
  const saveButtonPress = async (onClose) => {
    const res = await onSave({
      ...form,
      id_karyawan,
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
              <Input
                type="text"
                variant="bordered"
                label={name}
                placeholder={`Masukkan nama ${name}!`}
                value={form.nama}
                onValueChange={(val) => setForm({ ...form, nama: val })}
              />
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
