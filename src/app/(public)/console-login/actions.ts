"use server";

import { cookies } from "next/headers";
import { CONSOLE_AUTH } from "@/lib/secrets/auth";

/**
 * @SS-Auth-Audit
 * Module: [Login Actions]
 * Purpose: [Server-side credential verification and session management]
 */

export async function loginAction(formData: FormData) {
  const mobile = formData.get("mobile")?.toString();
  const password = formData.get("password")?.toString();

  if (mobile === CONSOLE_AUTH.mobile && password === CONSOLE_AUTH.password) {
    const cookieStore = await cookies();
    cookieStore.set("console_auth", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    });
    return { success: true };
  }

  return { success: false, error: "Invalid mobile number or password." };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("console_auth");
  return { success: true };
}
