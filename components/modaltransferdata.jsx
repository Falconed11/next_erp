import { capitalizeEachWord } from "@/app/utils/tools";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

const ModalTransferData = ({
  title,
  data,
  name,
  id,
  newId,
  setNewId,
  valueKey,
  labelKey,
  isOpen,
  onOpenChange,
  onSave,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Transfer {title}
            </ModalHeader>
            <ModalBody>
              <Input
                isDisabled={1}
                type="text"
                label="Kategori asal"
                value={capitalizeEachWord(name)}
                className="max-w-xs"
              />
              <Autocomplete
                label={`Target ${title}`}
                variant="bordered"
                placeholder={`Pilih target ${title}`}
                defaultItems={data}
                defaultSelectedKey={newId}
                className="max-w-xs"
                onSelectionChange={setNewId}
              >
                {(item) => {
                  const idOpt = item[valueKey];
                  return (
                    id != idOpt && (
                      <AutocompleteItem key={idOpt}>
                        {capitalizeEachWord(item[labelKey])}
                      </AutocompleteItem>
                    )
                  );
                }}
              </Autocomplete>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Batal
              </Button>
              <Button
                isDisabled={!newId}
                color="primary"
                onPress={() => onSave(onClose)}
              >
                Simpan
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalTransferData;
