import { Spinner } from "@heroui/react";
import { UserIcon, DeleteIcon } from "./icon";
import { capitalizeEachWord } from "@/app/utils/tools";

export default function App(user) {
  const status = user.user.status;
  if (status == "loading") return <Spinner />;
  const data = user.user.data.user;
  return (
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
  );
}
