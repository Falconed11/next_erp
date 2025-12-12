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
              {/* <Input
                isDisabled={1}
                type="text"
                label={`${title} Terpilih`}
                value={
                  <>
                    {capitalizeEachWord(name)} {customLabel?.(selected)}
                  </>
                }
                className="max-w-xs"
              /> */}
              <div>{title} Terpilih :</div>
              <div>
                {capitalizeEachWord(name)}{" "}
                {customLabel && " | " + customLabel(selected)}
              </div>
              <Autocomplete
                isVirtualized={false}
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
              <Button color="danger" variant="light" onPress={onClose}>
                Batal
              </Button>
              <Button
                isDisabled={!newId}
                color="primary"
                onPress={() => onSave(onClose)}
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
