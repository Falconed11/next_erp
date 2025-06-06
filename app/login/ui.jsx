"use client";
import React from "react";
import { Input, Button } from "@heroui/react";
import Link from "next/link";
import { EyeFilledIcon, EyeSlashFilledIcon } from "../../components/icon";

export default function App() {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center">
      <div className="border border-white bg-white/25 rounded-lg p-5 shadow-lg backdrop-blur-xs">
        <div>
          <Input label="Username" placeholder="Masukkan username" />
        </div>
        <div className="pt-3">
          <Input
            label="Password"
            placeholder="Massukan password"
            endContent={
              <button
                className="focus:outline-hidden"
                type="button"
                onClick={toggleVisibility}
              >
                {isVisible ? (
                  <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
            type={isVisible ? "text" : "password"}
            className="max-w-xs"
          />
        </div>
        <div className="pt-3 flex flex-row-reverse">
          <Link href="/produk?jwt=123">
            <Button color="primary">Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
