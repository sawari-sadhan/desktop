import React from "react";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main wrapper for protected console pages.
 * Enforces standard padding, minimum height, and flex layout.
 */
export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className={`flex-1 p-12 min-h-screen ${className}`}>
      <div className="w-full space-y-8">
        {children}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard page header layout.
 * Includes bottom border and padding to separate it from content.
 * Typically contains PageTitle on the left and PageActions on the right.
 */
export function PageHeader({ children, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-8 md:pb-12 ${className}`}>
      {children}
    </div>
  );
}

interface PageTitleProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Standardized page title component with optional subtitle, breadcrumbs, and icon.
 */
export function PageTitle({ title, subtitle, breadcrumbs, icon, className = "" }: PageTitleProps) {
  return (
    <div className={`space-y-4 md:space-y-6 ${className}`}>
      {breadcrumbs && (
        <div className="flex items-center gap-2 overflow-hidden">
          {breadcrumbs}
        </div>
      )}
      <div className="flex items-center gap-6">
        {icon && (
          <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-2xl text-slate-500">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface PageActionsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container for page-level actions (e.g., search, filters, primary action buttons).
 */
export function PageActions({ children, className = "" }: PageActionsProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {children}
    </div>
  );
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container for the main content of the page.
 */
export function PageContent({ children, className = "" }: PageContentProps) {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
}
