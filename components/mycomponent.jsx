import { Tooltip } from "@heroui/react";
import { Link } from "@heroui/react";

const MyChip = ({ text, theme }) => {
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
const LinkOpenNewTab = ({ content, link, icon }) => {
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
const OpenBlueLinkInNewTab = ({ link, children }) => {
  return (
    <Link
      className="text-blue-600 underline"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </Link>
  );
};
const NavLinkNewTab = ({ href, children }) => {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </Link>
  );
};
const company = {
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
const BKSHeader = ({ titleClassname }) => {
  return (
    <div className="flex flex-col">
      <div className={`${titleClassname}`}>Belga Karya Semesta</div>
      <div>General Trading - Mechanical Electrical - Supplies - Consultant</div>
      <div>Jogokaryan MJ 3/789, Mantrijeron - Yogyakarta Telp 08121553765</div>
    </div>
  );
};
const SVTHeader = ({ titleClassname }) => {
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
const FormatHeader = ({
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
const CompanyHeader = ({
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
const PrintWithHeader = ({ header, body }) => {
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

export {
  MyChip,
  OpenBlueLinkInNewTab,
  LinkOpenNewTab,
  NavLinkNewTab,
  BKSHeader,
  SVTHeader,
  CompanyHeader,
  PrintWithHeader,
};
