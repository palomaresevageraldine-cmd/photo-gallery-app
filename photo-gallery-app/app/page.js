import { redirect } from "next/navigation";
import { cookies } from "next/headers";
const { verifySessionToken, COOKIE_NAME } = require("../lib/auth");

export default function Home() {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (session) {
    redirect("/gallery");
  } else {
    redirect("/login");
  }
}
