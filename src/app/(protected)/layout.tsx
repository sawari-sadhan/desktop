import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * @SS-Auth-Audit
 * Module: [Protected Layout]
 * Purpose: [Enforce Authentication for Console Access]
 */

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("console_auth")?.value === "true";

  if (!isAuthenticated) {
    redirect("/console-login");
  }

  return <>{children}</>;
}
