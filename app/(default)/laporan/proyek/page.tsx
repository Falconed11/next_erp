import { getUser } from "@/app/utils/user";
import UI from "./ui";
export default async function app() {
  const user = await getUser();
  return (
    <>
      <UI user={user} />
    </>
  );
}
