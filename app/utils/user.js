import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export const getUser = async () => {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  const user = verify(token, process.env.JWT_SECRET);
  return user;
};
