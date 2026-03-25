import { redirect } from "next/navigation";
import { clearUserSession } from "@/lib/session";

export function SignOutForm() {
  async function signOut() {
    "use server";
    await clearUserSession();
    redirect("/");
  }

  return (
    <form action={signOut}>
      <button className="btn btn-ghost btn-sm" type="submit">
        Sign out
      </button>
    </form>
  );
}
