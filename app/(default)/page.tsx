import Image from "next/image";
import UI from "./ui";
import { getUser } from "../utils/user";

export default function Home() {
  const user = getUser();
  return (
    <main>
      <UI user={user} />
    </main>
  );
}
