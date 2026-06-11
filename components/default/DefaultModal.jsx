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
  Spinner,
} from "@heroui/react";
import { useEffect } from "react";

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
  onSaveSuccess,
  user,
  isRequiredNama = true,
  isLoading = false,
}) {
  const sessUser = user;
  const { id_karyawan: sessIdKaryawan } = sessUser;
  const saveButtonPress = async (onClose) => {
    const payload = {
      ...form,
      sessIdKaryawan,
      lastid_karyawan: id_karyawan,
      ...(form.method == "POST"
        ? { authorid_karyawan: id_karyawan, created_by: id_karyawan }
        : { updated_by: id_karyawan }),
    };
    try {
      const res = await onSave({
        ...payload,
      });
      const json = await res.json();
      data.mutate();
      onSaveSuccess?.(json, payload);
      onClose();
    } catch (error) {
      alert(error?.message || "Gagal menyimpan data!");
    }
  };
  useEffect(() => {
    console.log({ form });
  }, [form]);
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {form.method == "POST" ? "Tambah" : "Edit"} {name}
            </ModalHeader>
            <ModalBody>
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  {!disableNama && (
                    <Input
                      isRequired={isRequiredNama}
                      type="text"
                      color="default"
                      variant="bordered"
                      label={name}
                      placeholder={`Masukkan nama ${name}!`}
                      value={form.nama}
                      onValueChange={(val) =>
                        updateForm(setForm, { nama: val })
                      }
                    />
                  )}
                  <Input
                    type="text"
                    color="default"
                    variant="bordered"
                    label={"Keterangan"}
                    placeholder={`Masukkan keterangan!`}
                    value={form.keterangan}
                    onValueChange={(val) =>
                      updateForm(setForm, { keterangan: val })
                    }
                  />
                  {extraFields && extraFields(form, setForm)}
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onClick={onClose}>
                Batal
              </Button>
              <Button
                isLoading={isLoading}
                color="primary"
                variant="solid"
                onPress={() => saveButtonPress(onClose)}
              >
                Simpan
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
