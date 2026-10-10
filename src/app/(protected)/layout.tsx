/**
 * @SS-Auth-Audit
 * Module: [Protected Layout]
 * Purpose: [Protected shell wrapping all authenticated / console routes]
 */

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="protected-shell h-full w-full flex flex-col flex-1 min-h-0">
      {children}
    </div>
  );
}