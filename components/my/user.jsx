"use client";
import { Button, Spinner, Tooltip } from "@heroui/react";
import { UserIcon, DeleteIcon } from "./icon";
import Link from "next/link";
import { GoSignOut } from "react-icons/go";
import { useRouter } from "next/navigation";
import { capitalizeEachWord } from "@/app/utils/tools";
import { apiFetch } from "@/app/utils/fetchHelper";

export default function User({ user }) {
  // const status = user.user.status;
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await apiFetch("/api/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    router.push("/login");
    router.refresh();
  };
  return (
    <Tooltip
      content={
        <Button onClick={handleLogout} color="default" variant="bordered">
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
