import Image from "next/image";
import UI from "./ui";
import { getUser } from "./utils/user";

export default async function Home() {
  const user = await getUser();
  return (
    <main>
      <UI user={user} />
    </main>
  );
}
