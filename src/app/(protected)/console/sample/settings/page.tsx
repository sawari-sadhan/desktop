"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Key, 
  Shield, 
  Bell, 
  Webhook, 
  Building, 
  Trash2, 
  Copy, 
  Check, 
  Plus, 
  RefreshCw, 
  ExternalLink,
  AlertTriangle,
  Lock,
  Globe,
  Sliders,
  CheckCircle2,
  Save,
  Send
} from "lucide-react";
import { PageLayout, PageContent } from "../../components";
import { theme } from "../../theme";

interface ApiKeyItem {
  id: string;
  name: string;
  keyMasked: string;
  scope: string;
  created: string;
  lastUsed: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const activeTab = (searchParams?.get("tab") as "general" | "api" | "webhooks" | "notifications" | "danger") || "general";
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [orgName, setOrgName] = useState("SawariSadhan Automotive Intelligence");
  const [slug, setSlug] = useState("sawarisadhan-intelligence");
  const [defaultCurrency, setDefaultCurrency] = useState("NPR");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [webhookAlerts, setWebhookAlerts] = useState(false);

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: "key_1",
      name: "Production Ingestion Node",
      keyMasked: "sw_live_9f82••••••••••••34a1",
      scope: "read:write:graph",
      created: "Oct 01, 2026",
      lastUsed: "2 mins ago"
    },
    {
      id: "key_2",
      name: "Mobile App Gateway",
      keyMasked: "sw_live_41c0••••••••••••78b9",
      scope: "read:catalog:pricing",
      created: "Sep 15, 2026",
      lastUsed: "Just now"
    },
    {
      id: "key_3",
      name: "Analytics Scraper Worker",
      keyMasked: "sw_test_12ea••••••••••••09f4",
      scope: "read:telemetry",
      created: "Aug 20, 2026",
      lastUsed: "3 days ago"
    }
  ]);

  const [webhooks, setWebhooks] = useState([
    {
      id: "wh_1",
      url: "https://api.sawarisadhan.com/webhooks/catalog-sync",
      events: ["node.created", "price.updated", "market.linked"],
      status: "active",
      lastPing: "100% (200 OK)"
    },
    {
      id: "wh_2",
      url: "https://events.distributor.np/v1/auto-inbox",
      events: ["booking.status_changed"],
      status: "active",
      lastPing: "100% (200 OK)"
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    showToast("Key token copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateKey = () => {
    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: `Automated Service Token #${apiKeys.length + 1}`,
      keyMasked: `sw_live_${Math.random().toString(36).substring(2, 6)}••••••••••••${Math.random().toString(36).substring(2, 6)}`,
      scope: "read:write:graph",
      created: "Just now",
      lastUsed: "Never"
    };
    setApiKeys([newKey, ...apiKeys]);
    showToast("New API token provisioned successfully.");
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    showToast("API token revoked and invalidated.");
  };

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <PageContent className={theme.layout.contentWrapper}>
        

        {/* Action Toast */}
        {toastMessage && (
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs font-medium border border-slate-800 animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: GENERAL ORGANIZATION PROFILE */}
        {/* ========================================================================= */}
        {activeTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white p-7 rounded-[2rem] border border-slate-200 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Organization Profile</h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Basic identity attributes and routing domain for your automotive catalog.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Workspace Identifier / Slug
                    </label>
                    <div className="flex items-center">
                      <span className="px-3.5 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs font-mono text-slate-500">
                        api.sawarisadhan.com/org/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-r-xl px-4 py-2.5 text-xs font-mono font-medium text-slate-900 outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Default Currency Standard
                      </label>
                      <select
                        value={defaultCurrency}
                        onChange={(e) => setDefaultCurrency(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 outline-none"
                      >
                        <option value="NPR">NPR (Nepalese Rupee)</option>
                        <option value="INR">INR (Indian Rupee)</option>
                        <option value="AED">AED (UAE Dirham)</option>
                        <option value="USD">USD (US Dollar)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Catalog Synchronization Rate
                      </label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 outline-none">
                        <option value="realtime">Real-time (Stream Socket)</option>
                        <option value="hourly">Hourly Batch Synchronization</option>
                        <option value="daily">Daily Midnight Ingestion</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-7 rounded-[2rem] border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900">Regional Knowledge Fallbacks</h3>
                <p className="text-xs text-slate-500 font-normal">
                  Configure behavior when specific model trim pricing is missing in local market queries.
                </p>

                <div className="space-y-3">
                  {[
                    { title: "Dynamic FX Estimation", desc: "Calculate localized estimation based on live forex exchange rates when regional MSRP is unlinked." },
                    { title: "Showroom Inquiry Fallback", desc: "Display 'Price On Request' banner rather than converting global currency." },
                    { title: "Include Import Duty Tax Matrix", desc: "Automatically compute standard vehicle customs and road tax surcharge estimates." }
                  ].map((rule, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                      <input type="checkbox" defaultChecked={idx !== 1} className="mt-0.5 rounded text-slate-900" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{rule.title}</p>
                        <p className="text-xs text-slate-500 font-normal mt-0.5">{rule.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={() => showToast("Configuration saved across all nodes.")}
                    className={theme.buttons.primary}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Settings</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Sidebar Context */}
            <div className="space-y-6">
              <div className="bg-white p-7 rounded-[2rem] border border-slate-200 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Workspace Cluster</h4>
                  <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                    Connected to Asia-South-1 (Kathmandu/Mumbai Edge Nodes) with automated failover replication to UAE.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Status:</span><span className="font-semibold text-emerald-600">Optimal (99.98%)</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Node Sync:</span><span className="font-medium text-slate-700">Sub-second</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Database Engine:</span><span className="font-mono font-medium text-slate-700">PostgreSQL 16 + Redis</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: API KEYS & ACCESS TOKENS */}
        {/* ========================================================================= */}
        {activeTab === "api" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">API Access Tokens</h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Bearer authentication tokens for backend microservices, mobile apps, and scrapers.
                </p>
              </div>
              <button
                onClick={handleGenerateKey}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Token</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-6 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Token Name</th>
                      <th className="py-3 px-6 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Key Token</th>
                      <th className="py-3 px-6 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Access Scope</th>
                      <th className="py-3 px-6 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                      <th className="py-3 px-6 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Last Activity</th>
                      <th className="py-3 px-6 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">{key.name}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 font-mono text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 w-fit">
                            <span>{key.keyMasked}</span>
                            <button
                              onClick={() => copyToClipboard(key.keyMasked, key.id)}
                              className="text-slate-400 hover:text-slate-800 transition-colors"
                              title="Copy Token"
                            >
                              {copiedKey === key.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {key.scope}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500">{key.created}</td>
                        <td className="py-4 px-6 text-slate-500">{key.lastUsed}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteKey(key.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Revoke Token"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: WEBHOOKS & EVENT SUBSCRIPTIONS */}
        {/* ========================================================================= */}
        {activeTab === "webhooks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Configured Webhook Endpoints</h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Receive realtime HTTP POST payloads when catalog trim nodes are modified or published.
                </p>
              </div>
              <button
                onClick={() => showToast("Webhook registration dialog modal opened.")}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Webhook Endpoint</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {webhooks.map((wh) => (
                <div key={wh.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-mono font-semibold text-xs text-slate-900">{wh.url}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {wh.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 font-medium">Subscribed:</span>
                      {wh.events.map((ev) => (
                        <span key={ev} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-mono">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => showToast("Test ping sent! Received HTTP 200 OK.")}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>Test Ping</span>
                    </button>
                    <button
                      onClick={() => {
                        setWebhooks(webhooks.filter((w) => w.id !== wh.id));
                        showToast("Webhook endpoint unregistered.");
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Remove Webhook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: NOTIFICATIONS & ALERTS */}
        {/* ========================================================================= */}
        {activeTab === "notifications" && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-2xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Catalog Event Dispatch Rules</h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Choose the communication channels where ingestion errors and catalog approvals should notify administrators.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Email Incident Digest</p>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Summary of invalid OBD codes or duplicate VIN reports sent daily.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Slack Channel Ingestion Alerts</p>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Direct webhook notification to #engineering-feed on new vehicle trim insertions.</p>
                </div>
                <input
                  type="checkbox"
                  checked={slackAlerts}
                  onChange={(e) => setSlackAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Automated Pipeline Retries</p>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Automatically trigger secondary scraper when dealer pricing endpoint returns 503.</p>
                </div>
                <input
                  type="checkbox"
                  checked={webhookAlerts}
                  onChange={(e) => setWebhookAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DANGER ZONE */}
        {/* ========================================================================= */}
        {activeTab === "danger" && (
          <div className="bg-white p-8 rounded-3xl border border-rose-200 space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Irreversible Cluster Actions</h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Actions in this section require elevated organization owner permissions and affect all downstream client applications.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Purge Redis Knowledge Cache</p>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Flush all warm key-value query results and force cold graph queries.</p>
                </div>
                <button
                  onClick={() => showToast("Redis cache flushed across all regional nodes.")}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                >
                  Flush Cache
                </button>
              </div>

              <div className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-rose-700">Delete Entire Workspace & Purge Graph</p>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Permanently delete all vehicle models, regional prices, and revoke all tokens.</p>
                </div>
                <button
                  onClick={() => alert("Safety lock active: You must contact administrator support to delete this cluster.")}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                >
                  Purge Workspace
                </button>
              </div>
            </div>
          </div>
        )}

      </PageContent>
    </PageLayout>
  );
}

export default function SampleSettingsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-xs font-semibold text-slate-400">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
