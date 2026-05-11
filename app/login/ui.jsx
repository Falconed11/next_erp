"use client";
import React, { useState } from "react";
import { Input, Button, Form } from "@heroui/react";
import Link from "next/link";
import { EyeFilledIcon, EyeSlashFilledIcon } from "../../components/icon";
import { updateForm } from "../utils/tools";
import { useRouter } from "next/navigation";

export default function App({ error }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = React.useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const toggleVisibility = () => setIsVisible(!isVisible);
  const handleLogin = async (event) => {
    event.preventDefault();
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
      <Form onSubmit={handleLogin}>
        <div className="border border-white bg-white/25 rounded-lg p-5 shadow-lg backdrop-blur-xs flex flex-col gap-3">
          {error && (
            <div className="p-3 border rounded-xl border-danger text-danger">
              {error}. Pls, login!
            </div>
          )}
          <div>
            <Input
              variant="bordered"
              label="Username"
              placeholder="Masukkan username"
              value={form.username}
              onValueChange={(val) => updateForm(setForm, { username: val })}
            />
          </div>
          <div className="">
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
          <div className="flex flex-row-reverse">
            <Button type="submit" color="primary">
              Login
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
