"use client";
import Navigation from "@/components/navigation";
import User from "@/components/user";
import { Divider } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoHomeOutline } from "react-icons/io5";

export default function MainNav({ links, user, children }) {
  const pathName = usePathname();
  return (
    <section className="inline-flex- flex flex-col gap-3">
      <div></div>
      <div className="bg-black- w-screen sticky left-0">
        <div className="bg-red-500- mx-3">
          <div className="grid grid-cols-2 py-2 mr-3 rounded-lg bg-background ">
            <div className="basis-3/4- p-3 flex font-bold text-xl gap-2">
              <div className="content-center">
                <Link href="/">
                  <IoHomeOutline className="" />
                </Link>
              </div>
              <Divider orientation="vertical" />
              <div className="">ERP{pathName}</div>
            </div>
            {/* <div className="basis-1/4- flex flex-row-reverse"> */}
            <div className="text-right">
              <div className="px-3">
                <User user={user} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-3">
        <div></div>
        <div className={"sticky top-3"}>
          <Navigation navLinks={links} className="" />
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}
