"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Spinner,
} from "@heroui/react";
import { useClientFetch } from "@/hooks/useClientFetch";
import { useEffect } from "react";
import { renderQueryStates } from "@/app/utils/tools";

export default function Navigation({ navLinks, className }) {
  const proyek = useClientFetch(`proyek?countProgressNoOffer=true`);
  const pathname = usePathname();

  const title = pathname.split("/").at(-1);
  useEffect(() => {
    document.title = title;
  }, [title]);

  const queryStates = renderQueryStates({ proyek });
  if (queryStates) return queryStates;

  const numberProgressNoOffer = proyek.data.length;

  const isActivePath = (href) =>
    (pathname === "/" && href === "/") || pathname === href;

  // console.log(navLinks);
  return (
    <nav
      className={`mx-3- flex flex-col rounded-lg bg-background text-nowrap sticky top-3`}
    >
      <ul className="max-w-10 hover:max-w-xs transition-all duration-300 overflow-hidden">
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
                          {link.name} {">"}
                          <ProgressNoOfferNotification
                            link={link}
                            number={numberProgressNoOffer}
                          />
                        </div>
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="navigation dropdown">
                      {link.dropdown.map(({ key, name }) => {
                        return (
                          <DropdownItem
                            key={key}
                            textValue={name}
                            href={
                              key === "data" ? link.href : `${link.href}/${key}`
                            }
                          >
                            {name}
                          </DropdownItem>
                        );
                      })}
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
    <div className="bg-warning text-black rounded-full px-3 py-1 text-sm">
      {number}
    </div>
  );
};

const Icon = ({ icon }) => {
  return icon && <span className="text-2xl">{icon}</span>;
};
