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
// import { Badge, Avatar } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useClientFetch } from "@/app/utils/apiconfig";
import { useEffect } from "react";

export default function Navigation({ navLinks, className }) {
  const proyek = useClientFetch(`proyek?countProgressNoOffer=true`);
  const router = useRouter();
  const pathname = usePathname();

  const title = pathname.split("/").at(-1);
  useEffect(() => {
    document.title = title;
  }, [title]);

  if (proyek.error) return <div>failed to load</div>;
  if (proyek.isLoading) return <div>loading...</div>;

  const numberProgressNoOffer = proyek.data.length;

  const isActivePath = (href) =>
    (pathname === "/" && href === "/") || pathname === href;

  return (
    <nav
      className={`mx-3- flex flex-col rounded-lg bg-background ${className}`}
    >
      <ul>
        {navLinks.map((link) => {
          const active = isActivePath(link.href);
          const baseClass = "p-2 cursor-pointer";
          const activeClass = active ? "bg-slate-300 text-black" : "text-black";
          const icon = link?.icon;
          if (link.dropdown) {
            return (
              <li key={link.name}>
                <div className={`${baseClass} ${activeClass}`}>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button className="p-0 m-0 bg-transparent text-left justify-start text-base h-fit">
                        <div className="flex items-center gap-2">
                          <Icon icon={icon} />
                          {link.name}
                          <ProgressNoOfferNotification
                            link={link}
                            number={numberProgressNoOffer}
                          />
                        </div>
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="navigation dropdown"
                      onAction={(key) => {
                        const path =
                          key === "data" ? link.href : `${link.href}/${key}`;
                        router.push(path);
                      }}
                    >
                      {link.dropdown.map((item) => (
                        <DropdownItem key={item.key} textValue={item.name}>
                          {item.name}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </li>
            );
          }
          return (
            <li key={link.name}>
              <div className={`${baseClass} ${activeClass}`}>
                <Link
                  className="text-black items-center flex gap-2"
                  href={link.href}
                >
                  <Icon icon={icon} />
                  {link.name}
                  <ProgressNoOfferNotification
                    link={link}
                    number={numberProgressNoOffer}
                  />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const ProgressNoOfferNotification = ({ link, number }) => {
  if (link.name !== "Proyek" || number <= 0) return null;

  return (
    <div className="bg-warning text-black rounded-full px-2">{number}</div>
  );
};

const Icon = ({ icon }) => {
  return icon && <span className="text-2xl">{icon}</span>;
};
