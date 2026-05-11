import { capitalizeEachWord } from "@/app/utils/tools";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
  customLabel,
}) => {
  const selected = data?.find((o) => o.id == id);
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Transfer {title}
            </ModalHeader>
            <ModalBody>
              <div>{title} Terpilih :</div>
              <div>
                {capitalizeEachWord(name)}{" "}
                {customLabel && " | " + customLabel(selected)}
              </div>
              <Autocomplete
                isVirtualized={false}
                label={`Target ${title}`}
                color="default" variant="bordered"
                placeholder={`Pilih target ${title}`}
                defaultItems={data}
                defaultSelectedKey={newId}
                className="max-w-xs"
                onSelectionChange={setNewId}
              >
                {(item) => {
                  const idOpt = item[valueKey];
                  const label =
                    capitalizeEachWord(item[labelKey]) +
                    (customLabel ? " | " + customLabel(item) : "");
                  return (
                    id != idOpt && (
                      <AutocompleteItem key={idOpt} textValue={label}>
                        {label}
                      </AutocompleteItem>
                    )
                  );
                }}
              </Autocomplete>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onClick={onClose}>
                Batal
              </Button>
              <Button
                isDisabled={!newId}
                color="primary" variant="solid"
                onClick={() => onSave(onClose)}
              >
                Transfer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalTransferData;
