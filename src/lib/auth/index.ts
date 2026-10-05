"use server";

import { cookies } from "next/headers";
import { authClient, AccountContext } from "@lib/config";

/**
 * Server Action for Console Administrative Login.
 */
export async function consoleLoginAction(formData: FormData) {
  const identifier = formData.get("identifier")?.toString();
  const password = formData.get("password")?.toString();

  // 2. Database verification via authClient.login for Console users
  if (!identifier || !password) {
    return { success: false, error: "Please enter both mobile/email and password." };
  }

  try {
    const response = await authClient.login({
      identifier: identifier,
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
      cookieStore.set("console_user", JSON.stringify({
        name: response.user?.name || response.user?.email || "User",
        email: response.user?.email ?? "",
        memberId: response.user?.memberId ?? "",
      }), {
        path: "/",
        httpOnly: false, // Let client read if needed, or we just fetch via server action
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
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
  cookieStore.delete("console_user");
  return { success: true };
}

/**
 * Server Action to get the logged in console user details.
 */
export async function getConsoleUserAction() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("console_user");
  if (userCookie?.value) {
    try {
      // Cookies might be URL encoded
      const decoded = decodeURIComponent(userCookie.value);
      return JSON.parse(decoded);
    } catch (e) {
      // Fallback in case it wasn't encoded or parsing failed
      try {
        return JSON.parse(userCookie.value);
      } catch (err) {
        return null;
      }
    }
  }
  return null;
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

export type ConsoleAccount = {
  memberId: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
};

/**
 * Server Action to list all accounts with Console access.
 */
export async function listConsoleAccountsAction(): Promise<
  { success: true; accounts: ConsoleAccount[] } | { success: false; error: string }
> {
  try {
    const response = await authClient.listAccounts({ context: AccountContext.CONSOLE });
    return {
      success: true,
      accounts: (response.accounts || []).map((a) => ({
        memberId: a.memberId,
        name: a.name,
        email: a.email,
        mobile: a.mobile,
        createdAt: a.createdAt,
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Unable to connect to Authentication Service." };
  }
}

export type AccountDetail = {
  memberId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
  createdAt: string;
  updatedAt: string;
  memberType: string;
};

/**
 * Server Action to get details of a specific account by ID.
 */
export async function getConsoleAccountAction(id: string): Promise<
  { success: true; account: AccountDetail } | { success: false; error: string }
> {
  try {
    const response = await authClient.getAccount({ memberId: id });
    if (!response.account) {
      return { success: false, error: "Account not found." };
    }
    return {
      success: true,
      account: {
        memberId: response.account.memberId,
        firstName: response.account.firstName,
        middleName: response.account.middleName,
        lastName: response.account.lastName,
        email: response.account.email,
        mobile: response.account.mobile,
        createdAt: response.account.createdAt,
        updatedAt: response.account.updatedAt,
        memberType: response.account.memberType,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Unable to retrieve account details." };
  }
}

/**
 * Server Action for admin to change an account's password.
 */
export async function adminChangePasswordAction(formData: FormData) {
  const memberId = formData.get("memberId")?.toString();
  const password = formData.get("password")?.toString();

  if (!memberId || !password) {
    return { success: false, error: "Member ID and new password are required." };
  }

  try {
    const response = await authClient.adminChangePassword({
      memberId,
      newPassword: password,
    });

    if (response.success) {
      return { success: true, message: response.message || "Password updated successfully." };
    }

    return { success: false, error: response.message || "Failed to update password." };
  } catch (error: any) {
    return { success: false, error: error.message || "Unable to connect to Authentication Service." };
  }
}
