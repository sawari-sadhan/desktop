/**
 * @SS-Auth-Audit
 * Module: [Protected Layout]
 * Purpose: [Pass-through layout, authentication checks are now managed by middleware.ts]
 */

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
