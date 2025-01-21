import { Tooltip } from "@heroui/react";
import { Link } from "@heroui/react";

const MyChip = ({ text, theme }) => {
  console.log(text, theme);
  if (theme == "danger")
    return (
      <span className="bg-red-600 text-white p-1 rounded font-bold">
        {text}
      </span>
    );
  if (theme == "success")
    return (
      <span className="bg-green-400 text-white p-1 rounded font-bold">
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

export { MyChip, LinkOpenNewTab };
