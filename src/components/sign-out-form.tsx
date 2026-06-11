import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearUserSession } from "@/lib/session";

export function SignOutForm() {
  async function signOut() {
    "use server";
    await clearUserSession();
    redirect("/");
  }

  return (
    <form action={signOut}>
      <Button variant="ghost" size="sm" type="submit">
        Sign out
      </Button>
    </form>
  );
}
