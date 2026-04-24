import Link from "next/link";
import { Button } from "@heroui/react";

const navigationItems = [
  { href: "/coa", label: "COA" },
  { href: "/coa/coa-type", label: "COA Type" },
  { href: "/coa/coa-subtype", label: "COA Subtype" },
  { href: "/coa/coa-filter", label: "COA Filter" },
  { href: "/coa/peristiwa", label: "Peristiwa" },
  { href: "/coa/peristiwa-coa-map", label: "Peristiwa COA Map" },
];

export default function CoaNavigation({
  variant = "solid",
  color = "primary",
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {navigationItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button variant={variant} color={color}>
            {item.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}
