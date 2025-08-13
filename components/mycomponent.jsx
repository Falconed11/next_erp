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

const NavLinkNewTab = ({ href, children }) => {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </Link>
  );
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
        55581 Telp 08121553765 - 081578861740
      </div>
    </div>
  );
};

const CompanyHeader = ({ id, titleClassname }) => {
  return id == 1 ? (
    <BKSHeader titleClassname={titleClassname} />
  ) : (
    <SVTHeader titleClassname={titleClassname} />
  );
};

export {
  MyChip,
  LinkOpenNewTab,
  NavLinkNewTab,
  BKSHeader,
  SVTHeader,
  CompanyHeader,
};
