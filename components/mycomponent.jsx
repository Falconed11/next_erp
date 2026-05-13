import { API_PATH } from "@/app/utils/apiconfig";
import {
  key2set,
  renderQueryStates,
  set2key,
  updateForm,
} from "@/app/utils/tools";
import {
  Badge,
  Button,
  Checkbox,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { Link } from "@heroui/react";
import { useCallback, useMemo, useState } from "react";
import { AddIcon, DeleteIcon, EditIcon, EyeIcon } from "./icon";
import { dateMysqlToHeroUI, getDate, getDateFId } from "@/app/utils/date";
import Harga from "./harga";
import { TITLE_STYLE } from "@/app/utils/const";
import { useClientFetch } from "@/hooks/useClientFetch";
import { apiFetch } from "@/app/utils/fetchHelper";
import { I18nProvider } from "@react-aria/i18n";
import { parseDate } from "@internationalized/date";

export const MyChip = ({ text, theme }) => {
  console.log(text, theme);
  if (theme == "danger")
    return (
      <span className="bg-red-600 text-white p-1 rounded-sm font-bold">
        {text}
      </span>
    );
  if (theme == "success")
    return (
      <span className="bg-green-400 text-white p-1 rounded-sm font-bold">
        {text}
      </span>
    );
};
export const LinkOpenNewTab = ({ content, link, icon }) => {
  return (
    <Tooltip content={content}>
      <Link href={link}>
        <span
          // onClick={() => detailButtonPress(data)}
          role="link"
          onClick={(e) => {
            e.preventDefault();
            window.open(link);
          }}
          className="text-lg text-default-400 cursor-pointer active:opacity-50"
        >
          {icon}
        </span>
      </Link>
    </Tooltip>
  );
};
export const OpenBlueLinkInNewTab = ({ link, children, className }) => {
  return (
    <Link
      className={`text-blue-600 underline ${className}`}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </Link>
  );
};
export const NavLinkNewTab = ({ href, children }) => {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </Link>
  );
};
export const company = {
  1: {
    name: "Belga Karya Semesta",
    description:
      "General Trading - Mechanical Electrical - Supplies - Consultant",
    address: "Jogokaryan MJ 3/789, Mantrijeron - Yogyakarta Telp 08121553765",
    contact: "Telp 08121553765",
  },
  2: {
    name: "Satu Visi Teknikatama",
    description:
      "General Trading - Mechanical Electrical - Supplies - Consultant",
    address:
      "Wonosalam RT. 005 / RW. 009, Sukoharjo, Ngaglik Sleman - Yogyakarta 55581",
    contact: "Telp 08121553765 - 081578861740",
  },
};
export const BKSHeader = ({ titleClassname }) => {
  return (
    <div className="flex flex-col">
      <div className={`${titleClassname}`}>Belga Karya Semesta</div>
      <div>General Trading - Mechanical Electrical - Supplies - Consultant</div>
      <div>Jogokaryan MJ 3/789, Mantrijeron - Yogyakarta Telp 08121553765</div>
    </div>
  );
};
export const SVTHeader = ({ titleClassname }) => {
  return (
    <div className="flex flex-col">
      <div className={`${titleClassname}`}>Satu Visi Teknikatama</div>
      <div>General Trading - Mechanical Electrical - Supplies - Consultant</div>
      <div>
        Wonosalam RT. 005 / RW. 009, Sukoharjo, Ngaglik Sleman - Yogyakarta
        55581{" "}
        <span className="whitespace-nowrap">
          Telp 08121553765 - 081578861740
        </span>
      </div>
    </div>
  );
};
export const FormatHeader = ({
  titleClassname,
  name,
  description,
  address,
  contact,
  sideTitle,
}) => {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2">
        <div className={`${titleClassname}`}>{name}</div>
        {sideTitle}
      </div>
      <div>{description}</div>
      <div>
        {address} <span className="whitespace-nowrap">{contact}</span>
      </div>
    </div>
  );
};
export const CompanyHeader = ({
  name,
  description,
  address,
  contact,
  sideTitle,
  titleClassname,
}) => {
  return (
    <FormatHeader
      titleClassname={titleClassname}
      name={name}
      description={description}
      address={address}
      contact={contact}
      sideTitle={sideTitle}
    />
  );
};
export const PrintWithHeader = ({ header, body }) => {
  return (
    <table className="border-collapse w-full overscroll-none">
      <thead className="">
        <tr>
          <td className="">{header}</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{body}</td>
        </tr>
      </tbody>
    </table>
  );
};
export const ToDoList = ({ user }) => {
  const sessUser = user;
  const userId = sessUser?.id;
  const todolist = useClientFetch(userId ? `todolist?id_user=${userId}` : null);
  const status = useClientFetch("statustodolist");
  const [form, setForm] = useState({});
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const tambahButtonPress = async () => {
    setForm({ mode: "Tambah", deadlinedate: getDate(new Date()) });
    onOpen();
  };
  const editButtonPress = (data) => {
    setForm({ ...data, mode: "Edit" });
    onOpen();
  };
  const endpoint = "todolist";
  const deleteButtonPress = async (data) => {
    if (confirm(`Hapus status id:${data.id}, nama:${data.status}?`)) {
      try {
        await apiFetch(`${API_PATH}${endpoint}`, {
          method: "DELETE",
          body: JSON.stringify(data),
        });
        todolist.mutate();
      } catch (error) {
        alert(error.message || "Delete failed");
      }
    }
  };
  const simpanButtonPress = async (data, onClose) => {
    if (!data.kegiatan) return alert("Kegiatan wajib diisi");
    try {
      await apiFetch(`${API_PATH}${endpoint}`, {
        method: data.mode == "Tambah" ? "POST" : "PUT",
        body: JSON.stringify({
          ...data,
          id_user: userId,
        }),
      });
      todolist.mutate();
      onClose();
    } catch (error) {
      alert(error.message || "Save failed");
    }
  };
  const renderCell = useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "temphargamodal":
        return (
          <div className="text-right">
            <Harga harga={cellValue} />
          </div>
        );
      case "creationdate":
        return getDateFId(cellValue);
      case "deadlinedate":
        return (
          <div
            className={
              new Date(data.deadlinedate) <= new Date()
                ? "bg-danger text-white px-2 rounded-lg"
                : ""
            }
          >
            {getDateFId(cellValue)}
          </div>
        );
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit">
              <span
                onClick={() => editButtonPress(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <EditIcon />
              </span>
            </Tooltip>
            <LinkOpenNewTab
              content={"Detail Produk"}
              icon={<EyeIcon />}
              link={`/produk?id=${data.id_produk || null}`}
            />
            <Tooltip color="danger" variant="solid" content="Delete">
              <span
                onClick={() => deleteButtonPress(data)}
                className="text-lg text-danger cursor-pointer active:opacity-50"
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  const col = [
    {
      key: "aksi",
      label: "Aksi",
    },
    {
      key: "kegiatan",
      label: "Kegiatan",
    },
    {
      key: "keterangan",
      label: "Keterangan",
    },
    {
      key: "creationdate",
      label: "Tanggal di Buat",
    },
    {
      key: "deadlinedate",
      label: "Deadline",
    },
    {
      key: "status",
      label: "Status",
    },
  ];
  const queryStates = renderQueryStates({ todolist, status });
  if (queryStates) return queryStates;
  console.log(form);
  return (
    <>
      <Table
        isStriped
        isCompact
        className=""
        topContent={
          <div className="flex justify-between items-center">
            <div>To Do List</div>
            <MyAddButton onPress={tambahButtonPress} />
          </div>
        }
        aria-label="Example table with custom cells"
      >
        <TableHeader columns={col}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={todolist?.data || []}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.mode} To Do List
              </ModalHeader>
              <ModalBody>
                <Input
                  color="default"
                  variant="bordered"
                  type="text"
                  label="Kegiatan"
                  placeholder="Masukkan kegiatan!"
                  value={form.kegiatan}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      kegiatan: v,
                    })
                  }
                />
                <Textarea
                  color="default"
                  variant="bordered"
                  label="Keterangan"
                  placeholder="Masukkan keterangan!"
                  value={form.keterangan}
                  onValueChange={(v) => setForm({ ...form, keterangan: v })}
                />
                <MyDatePicker
                  form={form}
                  setForm={setForm}
                  label="Deadline"
                  // selected={
                  //   form.deadlinedate ? new Date(form.deadlinedate) : new Date()
                  // }
                  // onChange={(v) =>
                  //   setForm({ ...form, deadlinedate: getDate(v) })
                  // }
                  field="deadlinedate"
                />
                <Select
                  label="Status"
                  color="default"
                  variant="bordered"
                  placeholder="Pilih status!"
                  // disallowEmptySelection
                  selectedKeys={key2set(form.id_status)}
                  className="max-w-xs"
                  onSelectionChange={(v) => {
                    setForm({
                      ...form,
                      id_status: set2key(v),
                    });
                  }}
                >
                  {status.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.status}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  onClick={() => {
                    setForm({});
                    onClose();
                  }}
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  onClick={() => simpanButtonPress(form, onClose)}
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
};
export const StatusToDoList = () => {
  const status = useClientFetch("statustodolist");
  const [form, setForm] = useState({});
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const tambahButtonPress = async () => {
    setForm({ mode: "Tambah" });
    onOpen();
  };
  const editButtonPress = (data) => {
    setForm({ ...data, mode: "Edit" });
    onOpen();
  };
  const deleteButtonPress = async (data) => {
    if (confirm(`Hapus status id:${data.id}, nama:${data.status}?`)) {
      try {
        await apiFetch(`${API_PATH}statustodolist`, {
          method: "DELETE",
          body: JSON.stringify(data),
        });
        status.mutate();
      } catch (error) {
        alert(error.message || "Delete failed");
      }
    }
  };
  const simpanButtonPress = async (data, onClose) => {
    if (!data.status) return alert("Status wajib diisi");
    try {
      await apiFetch(`${API_PATH}statustodolist`, {
        method: data.mode == "Tambah" ? "POST" : "PUT",
        body: JSON.stringify({
          ...data,
        }),
      });
      status.mutate();
      onClose();
    } catch (error) {
      alert(error.message || "Save failed");
    }
  };
  const renderCell = useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "temphargamodal":
        return (
          <div className="text-right">
            <Harga harga={cellValue} />
          </div>
        );
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit">
              <span
                onClick={() => editButtonPress(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <EditIcon />
              </span>
            </Tooltip>
            {/* <LinkOpenNewTab
              content={"Detail Produk"}
              icon={<EyeIcon />}
              link={`/produk?id=${data.id_produk || null}`}
            /> */}
            <Tooltip color="danger" variant="solid" content="Delete">
              <span
                onClick={() => deleteButtonPress(data)}
                className="text-lg text-danger cursor-pointer active:opacity-50"
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  const col = [
    {
      key: "aksi",
      label: "Aksi",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "keterangan",
      label: "Keterangan",
    },
  ];
  const queryStates = renderQueryStates({ status });
  if (queryStates) return queryStates;
  return (
    <>
      <Table
        isStriped
        isCompact
        className=""
        topContent={
          <div className="flex justify-between items-center">
            <div>Status To Do List</div>
            <MyAddButton onPress={tambahButtonPress} />
          </div>
        }
        aria-label="Example table with custom cells"
      >
        <TableHeader columns={col}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={status.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.mode} Status
              </ModalHeader>
              <ModalBody>
                <Input
                  color="default"
                  variant="bordered"
                  type="text"
                  label="Status"
                  placeholder="Masukkan status!"
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      status: v,
                    })
                  }
                />
                <Textarea
                  color="default"
                  variant="bordered"
                  label="Keterangan"
                  placeholder="Masukkan keterangan!"
                  value={form.keterangan}
                  onValueChange={(v) => setForm({ ...form, keterangan: v })}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  onClick={() => {
                    setForm({});
                    onClose();
                  }}
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  onClick={() => simpanButtonPress(form, onClose)}
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
};
export const MyAddButton = ({ onPress }) => {
  return (
    <Button variant="shadow" size="sm" color="primary" onClick={onPress}>
      <span className="text-xl font-bold">
        <AddIcon />
      </span>
      Tambah
    </Button>
  );
};
export const TableTitle = ({ children }) => (
  <div className={TITLE_STYLE}>{children}</div>
);
export const TableHeaderWithAddButton = ({ title, onPress, isHighRole }) => (
  <div className="flex justify-between items-center">
    <TableTitle>{title}</TableTitle>
    {isHighRole && (
      <Button onClick={onPress} variant="shadow" size="sm" color="primary">
        <span className="text-xl font-bold">
          <AddIcon />
        </span>
        Tambah
      </Button>
    )}
  </div>
);
/**
 * @typedef {{ label: string, value: string | number }} Item
 */
/**
 * @param {{ arrayContent: Item[],
 * title: string,
 * link: string }} props
 */
export const FilterCard = ({ title, arrayContent = [], link }) => {
  return (
    <Badge
      color="danger"
      variant="solid"
      content={
        <Link className="px-1 text-white" href={link}>
          X
        </Link>
      }
    >
      <div className="flex flex-col gap-2 p-2 border shadow-lg rounded-lg">
        <div className="font-bold text-lg">{title}</div>
        {arrayContent.map((o, i) => (
          <div key={i}>
            {o.label} : {o.value}
          </div>
        ))}
      </div>
    </Badge>
  );
};
export const MyDatePicker = ({
  form,
  setForm,
  label = "Tanggal",
  field = "tanggal",
  extraField = {},
  isDisabled = false,
}) => {
  const [value, setValue] = useState(
    form[field] ? parseDate(getDate(form[field])) : null,
  );
  return (
    <I18nProvider locale="id-ID">
      <DatePicker
        isDisabled={isDisabled}
        showMonthAndYearPickers
        label={label}
        color="default"
        variant="bordered"
        value={value}
        onChange={(val) => {
          setValue(val);
          updateForm(setForm, {
            [field]: val ? getDate(val) : null,
            ...extraField,
          });
        }}
      />
    </I18nProvider>
  );
};
export const MyCheckBox = ({
  isDisabled,
  form,
  setForm,
  field,
  extraField,
  children,
}) => (
  <Checkbox
    isDisabled={isDisabled}
    isSelected={form[field]}
    onValueChange={(v) => updateForm(setForm, { [field]: v, ...extraField })}
  >
    {children}
  </Checkbox>
);
