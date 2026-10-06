export { middleware } from "./lib/navigation/guard";

export const config = {
  matcher: [
    "/console/:path*",
    "/dashboard/:path*",
    "/console-login",
    "/login",
    "/register",
  ],
};
