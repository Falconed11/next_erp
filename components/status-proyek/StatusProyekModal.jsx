import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
} from "@heroui/react";

const StatusProyekModal = ({ isOpen, onOpenChange, form, setForm, onSave }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {form.title} Status Proyek
            </ModalHeader>
            <ModalBody>
              <Input
                type="text"
                variant="bordered"
                label="Status"
                placeholder="Masukkan status!"
                value={form.nama}
                onValueChange={(val) => setForm({ ...form, nama: val })}
              />
              <NumberInput
                hideStepper
                isWheelDisabled
                formatOptions={{
                  useGrouping: false,
                }}
                variant="bordered"
                label="Progress"
                placeholder="Masukkan progress!"
                value={form.progress}
                onValueChange={(val) => setForm({ ...form, progress: val })}
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
};

export { StatusProyekModal };
