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
  Tooltip,
} from "@heroui/react";
import { useClientFetch } from "@/hooks/useClientFetch";
import { useEffect } from "react";
import { renderQueryStates } from "@/app/utils/tools";

export default function Navigation({ navLinks, className }) {
  const proyek = useClientFetch(`proyek?countProgressNoOffer=true`);
  const pathname = usePathname();
  const splitPath = (pathname) => pathname.split("/").filter(Boolean);
  const parts = splitPath(pathname);

  const title = parts.at(-1);
  useEffect(() => {
    document.title = title;
  }, [title]);

  // const queryStates = renderQueryStates({ proyek });
  // if (queryStates) return queryStates;

  const numberProgressNoOffer = proyek?.data?.length;
  const isLoading = proyek?.isLoading;

  const getActivePathStatus = (href) =>
    (pathname === "/" && href === "/") || parts[0] === splitPath(href)[0];

  // console.log(navLinks);
  return (
    <nav
      className={`mx-3- flex flex-col rounded-lg bg-background text-nowrap sticky top-3`}
    >
      <ul className="max-w-10 hover:max-w-xs transition-all duration-300 overflow-hidden-">
        {navLinks.map((link) => {
          const { href } = link;
          const baseClass = "cursor-pointer hover:bg-slate-300";
          const isActive = getActivePathStatus(href);
          const getClass = (isActive) =>
            isActive ? "bg-slate-300 text-black" : "text-black";
          const activeClass = getClass(isActive);
          const icon = link?.icon;
          if (link.dropdown) {
            return (
              <li key={link.name} className="relative">
                <div className={`${baseClass} ${activeClass} m-0 p-0`}>
                  <Dropdown className={`m-0 p-0`}>
                    <DropdownTrigger className=" m-0 p-2">
                      {/* <Button className="p-0 m-0 bg-transparent text-left justify-start text-base h-fit bg-danger"> */}
                      <div className="flex items-center gap-2 m-0">
                        <LiContent>
                          <Icon icon={icon} />
                          {link.name} {">"}
                        </LiContent>
                        <ProgressNoOfferNotification
                          link={link}
                          number={numberProgressNoOffer}
                        />
                      </div>
                      {/* </Button> */}
                    </DropdownTrigger>
                    <DropdownMenu aria-label="navigation dropdown">
                      {link.dropdown.map(({ key, name }) => {
                        const activePart = parts[1];
                        const isSubActive =
                          isActive &&
                          (activePart === key ||
                            (activePart == null && key === "data"));
                        const activeSubClass = getClass(isSubActive);
                        return (
                          <DropdownItem
                            key={key}
                            textValue={name}
                            className={`${activeSubClass} p-0 rounded-none flex flex-col`}
                          >
                            <Link
                              className="block p-2"
                              href={
                                key === "data"
                                  ? link.href
                                  : `${link.href}/${key}`
                              }
                            >
                              {name}
                            </Link>
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
            <li key={link.name} className="relative">
              <div className={`${baseClass} ${activeClass}`}>
                <Link
                  className="text-black items-center flex gap-2 p-2"
                  href={link.href}
                >
                  <LiContent>
                    <Icon icon={icon} />
                    {link.name}
                  </LiContent>
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
const LiContent = ({ children }) => (
  <div className="overflow-hidden flex gap-2">{children}</div>
);

const ProgressNoOfferNotification = ({ link, number }) => {
  if (link.name !== "Proyek" || number <= 0) return null;

  return (
    <Tooltip
      content={`${number} proyek berjalan, penawaran belum deal.`}
      size="lg"
      color="warning"
    >
      <div className="bg-warning text-black rounded-full px-2 py-0 text- absolute translate-x-1/2 top-0 right-0 overflow-visible">
        {number}
      </div>
    </Tooltip>
  );
};

const Icon = ({ icon }) => {
  return icon && <span className="text-2xl">{icon}</span>;
};
