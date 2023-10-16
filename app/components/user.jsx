"use client";
import { User } from "@nextui-org/react";
import { UserIcon, DeleteIcon } from "./icon";

export default function App() {
  return (
    <div className="flex flex-row">
      <div>
        <div className="p-1 mx-1 text-4xl font-bold rounded-full border border-black">
          <UserIcon />
        </div>
      </div>
      <div>
        <div>David Almacesar</div>
        <div className="text-gray-400">Admin</div>
      </div>
    </div>
  );
}
