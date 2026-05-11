"use client";
import { Button, Spinner, Tooltip } from "@heroui/react";
import { UserIcon, DeleteIcon } from "./icon";
import Link from "next/link";
import { GoSignOut } from "react-icons/go";
import { useRouter } from "next/navigation";
import { capitalizeEachWord } from "@/app/utils/tools";

export default function App({ user }) {
  // const status = user.user.status;
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    router.push("/login");
    router.refresh();
  };
  return (
    <Tooltip
      content={
        <Button onPress={handleLogout} variant="bordered">
          <GoSignOut />
          Signout
        </Button>
      }
      placement="bottom-end"
    >
      <div className="inline-flex flex-row">
        <div>
          <div>
            {capitalizeEachWord(user.username)} ({" "}
            {capitalizeEachWord(user.nama)} )
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
