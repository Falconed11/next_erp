import UI from "./ui";
import { getUser } from "@/app/utils/user";

export default async function CoaFilterPage() {
  const user = await getUser();
  return (
    <>
      <UI user={user} />
    </>
  );
}
