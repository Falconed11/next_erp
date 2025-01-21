"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { useRouter } from "next/navigation";

export default function Navigation({ navLinks }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    (<nav className="mx-3 flex flex-col rounded-lg columns-10 bg-background">
      <ul>
        {navLinks.map((link) => {
          const isActive =
            (pathname == "/" && pathname == link.href) ||
            (pathname == link.href && link.href != "/");
          if (link.dropdown) {
            const dropdown = link.dropdown;
            const customclass = isActive
              ? "bg-slate-300 text-black cursor-pointer p-2"
              : "text-black cursor-pointer p-2";
            return (
              (<li key={link.name}>
                <div className={customclass}>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button className="p-0 m-0 bg-transparent text-left justify-start text-base h-fit">
                        {link.name}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Static Actions"
                      onAction={(key) => {
                        if (key == "data") {
                          return router.push(link.href);
                        }
                        // return router.push(`/karyawan/${key}`);
                        return router.push(`${link.href}/${key}`);
                      }}
                    >
                      {dropdown.map((item) => (
                        (<DropdownItem textValue={item.name} key={item.key}>
                          {item.name}
                        </DropdownItem>)
                        //</Link>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </li>)
            );
          }

          return (
            <li key={link.name}>
              <div
                className={isActive ? "p-2 bg-slate-300" : "p-2"}
                key={link.name}
              >
                <Link className="text-black" href={link.href}>
                  {link.name}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>)
  );
}
