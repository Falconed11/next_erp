import { UserIcon, DeleteIcon } from "./icon";

export default function App(user) {
  const status = user.user.status;
  if (status == "loading") return <>Loading...</>;
  const data = user.user.data.user;
  return (
    <div className="flex flex-row">
      <div>
        <div className="p-1 mx-1 text-4xl font-bold rounded-full border border-black">
          <UserIcon />
        </div>
      </div>
      <div>
        <div>{data.nama}</div>
        <div className="text-gray-400">{data.peran}</div>
      </div>
    </div>
  );
}
