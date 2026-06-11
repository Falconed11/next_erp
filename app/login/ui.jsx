"use client";
import React, { useState } from "react";
import { Input, Button, Form, Spinner } from "@heroui/react";
import Link from "next/link";
import { EyeFilledIcon, EyeSlashFilledIcon } from "../../components/icon";
import { apiFetch } from "../utils/fetchHelper";
import { useRouter } from "next/navigation";
import { updateForm } from "../utils/tools";

export default function App({ error, redirect }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = React.useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    console.log("Signing in ...");
    try {
      const res = await apiFetch(`/api/login`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
    } catch (err) {
      console.log(
        "Err: ",
        err.message || "An error occurred while logging in.",
      );
      setIsLoading(false);
      return alert(err.message || "An error occurred while logging in.");
    }
    router.push(redirect || "/dashboard");
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
              color="default"
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
              color="default"
              variant="bordered"
              value={form.password}
              onValueChange={(val) => updateForm(setForm, { password: val })}
            />
          </div>
          <div className="flex flex-row-reverse gap-2 items-end">
            <Button
              type="submit"
              color="primary"
              variant="solid"
              size="sm"
              isLoading={isLoading}
            >
              Login
            </Button>
            <div>
              <Link
                href="/"
                className="self-start text-sm text-primary underline"
              >
                Landing Page
              </Link>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
