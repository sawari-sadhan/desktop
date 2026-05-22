"use server";

import { cookies } from "next/headers";
import { authClient, AccountContext } from "@lib/config";

/**
 * Server Action for Console Administrative Login.
 */
export async function consoleLoginAction(formData: FormData) {
  const mobile = formData.get("mobile")?.toString();
  const password = formData.get("password")?.toString();

  // 2. Database verification via authClient.login for Console users
  if (!mobile || !password) {
    return { success: false, error: "Please enter both mobile/email and password." };
  }

  try {
    const response = await authClient.login({
      identifier: mobile,
      password: password,
      context: AccountContext.CONSOLE,
    });

    if (response.success) {
      const cookieStore = await cookies();
      cookieStore.set("console_auth", "true", {
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
  const identifier = formData.get("mobile")?.toString() || formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!identifier || !password) {
    return { success: false, error: "Please enter both identifier and password/PIN." };
  }

  try {
    const response = await authClient.login({
      identifier: identifier,
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
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const mobile = formData.get("mobile")?.toString();
  const password = formData.get("password")?.toString();

  if (!name || !email || !password) {
    return { success: false, error: "Please fill in all required fields." };
  }

  try {
    const response = await authClient.register({
      firstName: name,
      middleName: "",
      lastName: "",
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

/**
 * Server Action for Console Registration.
 */
export async function consoleRegisterAction(formData: FormData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const mobile = formData.get("mobile")?.toString();
  const password = formData.get("password")?.toString();

  if (!name || !email || !password) {
    return { success: false, error: "Please fill in all required fields." };
  }

  try {
    const response = await authClient.register({
      firstName: name,
      middleName: "",
      lastName: "",
      email,
      mobile: mobile || "",
      password,
      context: AccountContext.CONSOLE,
    });

    if (response.success) {
      return {
        success: true,
        message: response.message || "Console account registered successfully! You can now log in."
      };
    }

    return { success: false, error: response.message || "Registration failed." };
  } catch (error: any) {
    return { success: false, error: error.message || "Unable to connect to Authentication Service." };
  }
}
