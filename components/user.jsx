import { Spinner, Tooltip } from "@heroui/react";
import { UserIcon, DeleteIcon } from "./icon";
import { capitalizeEachWord } from "@/app/utils/tools";
import Link from "next/link";
import { GoSignOut } from "react-icons/go";

export default function App(sess) {
  // const status = user.user.status;
  const sessUser = sess.user;
  if (sessUser.status == "loading") return <Spinner />;
  const data = sessUser.data;
  if (!data) return <>No User</>;
  const user = data.user;
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
      placement="bottom-end"
    >
      <div className="inline-flex flex-row">
        <div>
          <div>
            {capitalizeEachWord(user.username)}
            {user.nama ? capitalizeEachWord(` ( ${user.nama} )`) : ""}
          </div>
          <div className="text-gray-400">{capitalizeEachWord(user.peran)}</div>
        </div>
        <div className="p-1 mx-1 text-4xl font-bold rounded-full border border-black">
          <UserIcon />
        </div>
      </div>
    </Tooltip>
  );
}
