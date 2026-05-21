import Image from "next/image";
import UI from "./ui";
import { getUser } from "../utils/user";
import { cookies } from "next/headers";

export default async function Home() {
  const user = await getUser();
  return (
    <main>
      <UI user={user} />
    </main>
  );
}
