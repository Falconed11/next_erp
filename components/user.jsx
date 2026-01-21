import { Spinner, Tooltip } from "@heroui/react";
import { UserIcon, DeleteIcon } from "./icon";
import { capitalizeEachWord } from "@/app/utils/tools";
import Link from "next/link";
import { GoSignOut } from "react-icons/go";

export default function App(user) {
  const status = user.user.status;
  if (status == "loading") return <Spinner />;
  const data = user.user.data.user;
  return (
    <Tooltip
      content={
        <Link
          className="text-black items-center flex gap-2"
          href="/api/auth/signout"
        >
          <GoSignOut />
          Signout
        </Link>
      }
    >
      <div className="inline-flex flex-row">
        <div>
          <div>
            {capitalizeEachWord(data.username)}
            {data.nama ? capitalizeEachWord(` ( ${data.nama} )`) : ""}
          </div>
          <div className="text-gray-400">{capitalizeEachWord(data.peran)}</div>
        </div>
        <div className="p-1 mx-1 text-4xl font-bold rounded-full border border-black">
          <UserIcon />
        </div>
      </div>
    </Tooltip>
  );
}
