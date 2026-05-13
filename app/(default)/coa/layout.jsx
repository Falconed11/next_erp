import CoaNavigation from "./components/CoaNavigation";
import { getUser } from "@/app/utils/user";

export default function CoaLayout({ children }) {
  const user = getUser();
  return (
    <div className="flex flex-col gap-2">
      <CoaNavigation user={user} />
      {children}
    </div>
  );
}
