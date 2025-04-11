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

export default function Navigation({ navLinks }) {
  const proyek = useClientFetch(`proyek?countProgressNoOffer=true`);
  const router = useRouter();
  const pathname = usePathname();

  if (proyek.error) return <div>failed to load</div>;
  if (proyek.isLoading) return <div>loading...</div>;

  const numberProgressNoOffer = proyek.data.length;
  return (
    <nav className="mx-3 flex flex-col rounded-lg columns-10 bg-background">
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
              <li key={link.name}>
                {/* <Badge color="warning" content="5"> */}
                <div className={customclass}>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button className="p-0 m-0 bg-transparent text-left justify-start text-base h-fit">
                        <div>{link.name}</div>
                        <ProgressNoOfferNotification
                          link={link}
                          numberProgressNoOffer={numberProgressNoOffer}
                        />
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
                        <DropdownItem textValue={item.name} key={item.key}>
                          {item.name}
                        </DropdownItem>
                        //</Link>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
                {/* </Badge> */}
              </li>
            );
          }

          return (
            <li key={link.name}>
              <div
                className={isActive ? "p-2 bg-slate-300" : "p-2"}
                key={link.name}
              >
                <Link className="text-black flex gap-2" href={link.href}>
                  <div>{link.name}</div>
                  <ProgressNoOfferNotification
                    link={link}
                    numberProgressNoOffer={numberProgressNoOffer}
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

const ProgressNoOfferNotification = ({ link, numberProgressNoOffer }) => {
  return (
    <>
      {link.name == "Proyek" && numberProgressNoOffer > 0 ? (
        <div className="text-black bg-warning rounded-full px-2">
          {numberProgressNoOffer}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
