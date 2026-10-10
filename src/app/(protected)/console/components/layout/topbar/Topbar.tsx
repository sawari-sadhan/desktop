"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTopbar } from './TopbarActions';
import { 
  ChevronRight, 
  ArrowLeft,
  MapPin,
  SlidersHorizontal,
  Image as ImageIcon,
  Car,
  Building,
  Key,
  Webhook,
  Bell,
  AlertTriangle,
  Gauge,
  Tag,
  Activity,
  FileCode
} from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const getPageInfo = (pathname: string) => {
  if (pathname.includes('/sample')) return { title: 'Style Samples', subtitle: 'Design System & Page Archetypes' };
  if (pathname.includes('/obd')) return { title: 'OBD-II Codes', subtitle: 'Diagnostic Trouble Code Registry' };
  if (pathname.includes('/brand')) return { title: 'Brand', subtitle: 'Managing manufacturers in Knowledge Graph' };
  if (pathname.includes('/attribute')) return { title: 'Technical Attributes', subtitle: 'Managing technical features in Knowledge Graph' };
  if (pathname.includes('/ingest/4w')) return { title: '4W Node Ingestion', subtitle: '4-Wheel vehicles classification & node ingestion' };
  if (pathname.includes('/ingest/2w')) return { title: '2W Node Ingestion', subtitle: '2-Wheel vehicles classification & node ingestion' };
  if (pathname.includes('/ingest')) return { title: 'Node Ingestion', subtitle: 'Select vehicle domain to begin ingestion' };
  if (pathname.includes('/access')) return { title: 'Access Control', subtitle: 'Security & Permissions Management' };
  if (pathname.includes('/highlights')) return { title: 'System Highlights', subtitle: 'Key Metrics and Insights' };
  if (pathname === '/console/media' || pathname.startsWith('/console/media/')) return { title: 'Media Control Center', subtitle: 'Global repository of uploaded images and videos' };
  return { title: 'System Overview', subtitle: 'Real-time Registry Intelligence' };
};

export const Topbar = () => {
  const { actions } = useTopbar();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') || 'general' : 'general';
  const { title, subtitle } = getPageInfo(pathname);

  const segments = pathname.split('/').filter(Boolean);
  const isSubPage = segments.length > 2;
  const currentSlug = isSubPage ? segments[segments.length - 1] : null;

  const crumbs: BreadcrumbItem[] = [];
  let navTabs: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; isActive: boolean }[] = [];

  if (pathname.includes('/brand')) {
    crumbs.push({ label: 'Brand', href: '/console/brand' });
    const brandIdx = segments.indexOf('brand');
    const modelIdx = segments.indexOf('model');
    const variantIdx = segments.indexOf('variant');
    
    const brandSlug = (brandIdx !== -1 && brandIdx + 1 < segments.length) ? segments[brandIdx + 1] : null;
    const modelSlug = (modelIdx !== -1 && modelIdx + 1 < segments.length) ? segments[modelIdx + 1] : null;
    const variantSlug = (variantIdx !== -1 && variantIdx + 1 < segments.length) ? segments[variantIdx + 1] : null;
    const lastSeg = segments[segments.length - 1];

    if (brandSlug && brandSlug !== 'model') {
      const href = `/console/brand/${brandSlug}`;
      crumbs.push({ label: brandSlug.replace(/-/g, ' '), href });
    }
    if (modelSlug) {
      const href = brandSlug ? `/console/brand/${brandSlug}/model/${modelSlug}` : undefined;
      crumbs.push({ label: modelSlug.replace(/-/g, ' '), href });
    }
    if (variantSlug) {
      const href = (brandSlug && modelSlug) ? `/console/brand/${brandSlug}/model/${modelSlug}/variant/${variantSlug}` : undefined;
      crumbs.push({ label: variantSlug.replace(/-/g, ' '), href });
    }
    const recognizedTabs = ['specification', 'media', 'availability', 'detail'];
    if (recognizedTabs.includes(lastSeg)) {
      crumbs.push({ label: lastSeg });
    } else if (segments.length > 1 && recognizedTabs.includes(segments[segments.length - 2])) {
      const parentTab = segments[segments.length - 2];
      const parentHref = (brandSlug && modelSlug && variantSlug)
        ? `/console/brand/${brandSlug}/model/${modelSlug}/variant/${variantSlug}/${parentTab}`
        : (brandSlug && modelSlug)
        ? `/console/brand/${brandSlug}/model/${modelSlug}/${parentTab}`
        : undefined;
      crumbs.push({ label: parentTab, href: parentHref });
      crumbs.push({ label: lastSeg.replace(/-/g, ' ') });
    }

    if (brandSlug && modelSlug && variantSlug) {
      const variantBase = `/console/brand/${brandSlug}/model/${modelSlug}/variant/${variantSlug}`;
      navTabs = [
        {
          name: "Specification",
          href: `${variantBase}/specification`,
          icon: SlidersHorizontal,
          isActive: pathname.startsWith(`${variantBase}/specification`) || pathname === variantBase,
        },
        {
          name: "Media",
          href: `${variantBase}/media`,
          icon: ImageIcon,
          isActive: pathname.startsWith(`${variantBase}/media`),
        },
        {
          name: "Availability",
          href: `${variantBase}/availability`,
          icon: MapPin,
          isActive: pathname.startsWith(`${variantBase}/availability`),
        },
      ];
    }
  } else if (pathname.includes('/attribute')) {
    crumbs.push({ label: 'Attributes', href: '/console/attribute' });
    const attrIdx = segments.indexOf('attribute');
    if (attrIdx !== -1 && attrIdx + 1 < segments.length) {
      const code = segments[attrIdx + 1];
      crumbs.push({ label: code.replace(/-/g, ' '), href: `/console/attribute/${code}` });
      if (segments.length > attrIdx + 2) {
        const sub = segments[attrIdx + 2];
        crumbs.push({ label: sub.replace(/-/g, ' ') });
      }
    }
  } else if (pathname.includes('/obd')) {
    crumbs.push({ label: 'OBD-II Codes', href: '/console/obd' });
    const obdIdx = segments.indexOf('obd');
    if (obdIdx !== -1 && obdIdx + 1 < segments.length) {
      crumbs.push({ label: segments[obdIdx + 1].replace(/-/g, ' ') });
    }
  } else if (pathname.startsWith('/console/media')) {
    crumbs.push({ label: 'Media Control', href: '/console/media' });
    const mediaIdx = segments.indexOf('media');
    if (mediaIdx !== -1 && mediaIdx + 1 < segments.length) {
      const sub = segments[mediaIdx + 1];
      crumbs.push({ label: sub === 'model' ? 'Models Directory' : sub.replace(/-/g, ' '), href: `/console/media/${sub}` });
      if (segments.length > mediaIdx + 2) {
        crumbs.push({ label: segments[mediaIdx + 2].replace(/-/g, ' ') });
      }
    }
    navTabs = [
      {
        name: 'All Media',
        href: '/console/media',
        icon: ImageIcon,
        isActive: pathname === '/console/media',
      },
      {
        name: 'By Model',
        href: '/console/media/model',
        icon: Car,
        isActive: pathname.startsWith('/console/media/model'),
      },
    ];
  } else if (pathname.includes('/ingest')) {
    crumbs.push({ label: 'Node Ingestion', href: '/console/ingest' });
    const ingestIdx = segments.indexOf('ingest');
    if (ingestIdx !== -1 && ingestIdx + 1 < segments.length) {
      const sub = segments[ingestIdx + 1];
      crumbs.push({ label: sub === '4w' ? '4 Wheel' : sub === '2w' ? '2 Wheel' : sub.replace(/-/g, ' ') });
    }
  } else if (pathname.includes('/sample')) {
    crumbs.push({ label: 'Style Samples', href: '/console/sample' });
    const sampleIdx = segments.indexOf('sample');
    if (sampleIdx !== -1 && sampleIdx + 1 < segments.length) {
      const sub = segments[sampleIdx + 1];
      const subLabels: Record<string, string> = {
        dashboard: 'Dashboard',
        list: 'Records Table',
        form: 'Form & Input',
        detail: 'Detail View',
        modal: 'Modals & Overlays',
        pipeline: 'Pipeline & Board',
        settings: 'Workspace Settings',
      };
      crumbs.push({ label: subLabels[sub] || sub.replace(/-/g, ' ') });
    }

    if (pathname.includes('/sample/settings')) {
      navTabs = [
        {
          name: 'General',
          href: '/console/sample/settings?tab=general',
          icon: Building,
          isActive: currentTab === 'general',
        },
        {
          name: 'API Keys',
          href: '/console/sample/settings?tab=api',
          icon: Key,
          isActive: currentTab === 'api',
        },
        {
          name: 'Webhooks',
          href: '/console/sample/settings?tab=webhooks',
          icon: Webhook,
          isActive: currentTab === 'webhooks',
        },
        {
          name: 'Notifications',
          href: '/console/sample/settings?tab=notifications',
          icon: Bell,
          isActive: currentTab === 'notifications',
        },
        {
          name: 'Danger Zone',
          href: '/console/sample/settings?tab=danger',
          icon: AlertTriangle,
          isActive: currentTab === 'danger',
        },
      ];
    } else if (pathname.includes('/sample/detail')) {
      navTabs = [
        {
          name: 'Overview & Media',
          href: '/console/sample/detail?tab=overview',
          icon: Car,
          isActive: currentTab === 'overview',
        },
        {
          name: 'Technical Specs',
          href: '/console/sample/detail?tab=specs',
          icon: Gauge,
          isActive: currentTab === 'specs',
        },
        {
          name: 'Regional Pricing',
          href: '/console/sample/detail?tab=markets',
          icon: Tag,
          isActive: currentTab === 'markets',
        },
        {
          name: 'Graph Relations',
          href: '/console/sample/detail?tab=graph',
          icon: Activity,
          isActive: currentTab === 'graph',
        },
        {
          name: 'Change Audit Log',
          href: '/console/sample/detail?tab=history',
          icon: FileCode,
          isActive: currentTab === 'history',
        },
      ];
    }
  } else if (isSubPage) {
    crumbs.push({ label: title });
    if (currentSlug) {
      crumbs.push({ label: currentSlug.replace(/-/g, ' ') });
    }
  }

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 relative z-30">
      <div className="flex items-center gap-5">
        {isSubPage && (
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex items-center">
          {crumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase flex-wrap max-w-3xl">
              {crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    {isLast || !crumb.href ? (
                      <span className={isLast ? "text-slate-900 font-bold" : "text-slate-500 font-medium"}>
                        {crumb.label}
                      </span>
                    ) : (
                      <Link 
                        href={crumb.href}
                        className="text-slate-500 hover:text-slate-900 transition-colors font-medium"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          ) : (
            <div className="space-y-0.5">
              <h1 className="text-base font-bold text-slate-900 tracking-tight uppercase">
                {title}
              </h1>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {subtitle}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {navTabs.length > 0 && (
          <div className="flex items-center gap-2">
            {navTabs.map((tab) => {
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-3xl text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 group relative ${
                    tab.isActive
                      ? "bg-slate-50 text-slate-900 border border-slate-200 font-bold"
                      : "text-slate-500 bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 transition-colors ${tab.isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>
        )}
        <div id="topbar-actions" className="flex items-center gap-3">{actions}</div>
      </div>
    </header>
  );
};
