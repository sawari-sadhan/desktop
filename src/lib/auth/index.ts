"use server";

import { cookies } from "next/headers";
import { CONSOLE_AUTH } from "@lib/secrets/auth";
import { authClient, AccountContext } from "@lib/config";

/**
 * Server Action for Console Administrative Login.
 */
export async function consoleLoginAction(formData: FormData) {
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

/**
 * Server Action for Console Logout.
 */
export async function consoleLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("console_auth");
  return { success: true };
}

/**
 * Server Action for Member Login.
 */
export async function memberLoginAction(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  try {
    const response = await authClient.login({
      identifier: email,
      password: password,
      context: AccountContext.DASHBOARD,
    });

    if (response.success && response.token) {
      const cookieStore = await cookies();
      cookieStore.set("dashboard_auth", response.token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: "lax",
      });
      return { 
        success: true, 
        user: {
          memberId: response.user?.memberId ?? "",
          email: response.user?.email ?? "",
          name: response.user?.name ?? "",
        } 
      };
    }

    return { success: false, error: response.message || "Invalid credentials." };
  } catch (error: any) {
    return { success: false, error: error.message || "Unable to connect to Authentication Service." };
  }
}

/**
 * Server Action for Member Logout.
 */
export async function memberLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("dashboard_auth");
  return { success: true };
}

/**
 * Server Action for Member Registration.
 */
export async function registerAction(formData: FormData) {
  const firstName = formData.get("first_name")?.toString();
  const middleName = formData.get("middle_name")?.toString() || "";
  const lastName = formData.get("last_name")?.toString();
  const email = formData.get("email")?.toString();
  const mobile = formData.get("mobile")?.toString();
  const password = formData.get("password")?.toString();

  if (!firstName || !lastName || !email || !password) {
    return { success: false, error: "Please fill in all required fields." };
  }

  try {
    const response = await authClient.register({
      firstName,
      middleName,
      lastName,
      email,
      mobile: mobile || "",
      password,
      context: AccountContext.DASHBOARD,
    });

    if (response.success) {
      return { 
        success: true, 
        message: response.message || "Account registered successfully! You can now log in." 
      };
    }

    return { success: false, error: response.message || "Registration failed." };
  } catch (error: any) {
    return { success: false, error: error.message || "Unable to connect to Authentication Service." };
  }
}
