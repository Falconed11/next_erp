"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navigation({ navLinks }) {
  const pathname = usePathname();
  return (
    <nav className="mx-3 flex flex-col rounded-lg columns-10 bg-background">
      {navLinks.map((link) => {
        const isActive =
          (pathname == "/" && pathname == link.href) ||
          (pathname.includes(link.href) && link.href != "/");

        return (
          <div
            className={isActive ? "p-2 bg-slate-300" : "p-2"}
            key={link.name}
          >
            <Link className="text-black" href={link.href}>
              {link.name}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
