import { auth } from "auth";
import { SignIn } from "@/components/auth-components";
import {redirect} from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard")
  }

  redirect("/dashboard")
}
