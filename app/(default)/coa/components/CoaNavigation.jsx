"use client";
import Link from "next/link";
import { Button } from "@heroui/react";

export default function CoaNavigation({
  variant = "solid",
  color = "primary",
  user,
}) {
  const navigationItems = [
    { href: "/coa/coa-type", label: "COA Type" },
    { href: "/coa/coa-subtype", label: "COA Subtype" },
    { href: "/coa", label: "COA" },
    { href: "/coa/coa-filter", label: "COA Filter" },
    { href: "/coa/laporan-relation", label: "Laporan Relation" },
    ...(user.peran == "super"
      ? [
          { href: "/coa/peristiwa", label: "Peristiwa" },
          { href: "/coa/peristiwa-coa-map", label: "Peristiwa COA Map" },
        ]
      : []),
  ];
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
