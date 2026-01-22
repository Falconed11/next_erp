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
  isOpen,
  onOpenChange,
  form,
  setForm,
  onSave,
  name,
}) {
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
              <Button color="primary" onPress={() => onSave(onClose)}>
                Simpan
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
