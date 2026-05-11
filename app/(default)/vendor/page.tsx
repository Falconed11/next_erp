import UI from "./ui";
import { getUser } from "@/app/utils/user";

export default async function app() {
  const user = await getUser();
  return <UI user={user} />;
}
