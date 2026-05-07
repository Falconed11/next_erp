"use client";
import React, { useState } from "react";
import { Input, Button } from "@heroui/react";
import Link from "next/link";
import { EyeFilledIcon, EyeSlashFilledIcon } from "../../components/icon";
import { updateForm } from "../utils/tools";
import { useRouter } from "next/navigation";

export default function App() {
  const router = useRouter();
  const [isVisible, setIsVisible] = React.useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const toggleVisibility = () => setIsVisible(!isVisible);
  const handleLogin = async () => {
    console.log("Login pressed", form);

    const res = await fetch(`/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/");
    } else {
      alert(data.message || "Login failed");
    }
  };

  // console.log(form);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center">
      <div className="border border-white bg-white/25 rounded-lg p-5 shadow-lg backdrop-blur-xs">
        <div>
          <Input
            variant="bordered"
            label="Username"
            placeholder="Masukkan username"
            value={form.username}
            onValueChange={(val) => updateForm(setForm, { username: val })}
          />
        </div>
        <div className="pt-3">
          <Input
            className="max-w-xs"
            endContent={
              <button
                aria-label="toggle password visibility"
                className="focus:outline-solid outline-transparent"
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
            label="Password"
            placeholder="Enter your password"
            type={isVisible ? "text" : "password"}
            variant="bordered"
            value={form.password}
            onValueChange={(val) => updateForm(setForm, { password: val })}
          />
        </div>
        <div className="pt-3 flex flex-row-reverse">
          <Button onClick={handleLogin} color="primary">
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
