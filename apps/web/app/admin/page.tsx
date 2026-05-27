"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Database, KeyRound, RefreshCw, Shield, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useI18n } from "@/components/language-provider";
import Reveal from "@/components/reveal";
import StatusMessage from "@/components/status-message";

export default function AdminPage() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pubchemLimit, setPubchemLimit] = useState(5000);
  const [pubchemStartCid, setPubchemStartCid] = useState(1);
  const [chebiLimit, setChebiLimit] = useState(5000);
  const [hmdbFile, setHmdbFile] = useState("./data/hmdb_metabolites.xml");
  const [message, setMessage] = useState<{ tone: "success" | "network" | "info"; text: string } | null>(null);

  const headers = useMemo(() => (password ? { "x-admin-password": password } : {}), [password]);

  const refresh = useCallback(async () => {
    const [jobsRes, statsRes] = await Promise.all([
      api.get("/imports/jobs", { headers }),
      api.get("/admin/overview", { headers })
    ]);
    setJobs(jobsRes.data.data);
    setStats(statsRes.data.data);
  }, [headers]);

  useEffect(() => {
    if (!password) return;
    refresh().catch(() => null);
  }, [password, refresh]);

  const run = async (type: "pubchem" | "chebi" | "hmdb") => {
    setMessage(null);
    try {
      if (type === "pubchem") {
        await api.post(
          "/imports/pubchem/start",
          { startCid: pubchemStartCid, limit: pubchemLimit, resume: true },
          { headers }
        );
      }
      if (type === "chebi") {
        await api.post("/imports/chebi/start", { limit: chebiLimit }, { headers });
      }
      if (type === "hmdb") {
        await api.post("/imports/hmdb/start", { file: hmdbFile }, { headers });
      }
      setMessage({ tone: "success", text: t("importSuccess") });
      await refresh();
    } catch (error: any) {
      setMessage({ tone: "network", text: error?.response?.data?.error?.message ?? t("importError") });
    }
  };

  const clearDemo = async () => {
    try {
      await api.delete("/admin/demo-data", { headers });
      await refresh();
      setMessage({ tone: "success", text: t("clearDemo") });
    } catch (error: any) {
      setMessage({ tone: "network", text: error?.response?.data?.error?.message ?? t("importError") });
    }
  };

  return (
    <div className="space-y-4">
      <Reveal>
        <Card className="space-y-3">
          <p className="section-kicker">04. {t("adminTitle")}</p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("adminTitle")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("adminSubtitle")}</p>
            </div>
            <Button type="button" variant="outline" onClick={() => refresh().catch(() => null)} disabled={!password}>
              <RefreshCw size={14} />
              {t("refresh")}
            </Button>
          </div>

          <div className="surface-subtle rounded-xl p-3">
            <label htmlFor="admin-password" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t("adminPasswordLabel")}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="admin-password"
                type="password"
                placeholder={t("adminPasswordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/70 px-3 py-2 text-xs text-muted-foreground">
                <KeyRound size={14} />
                ADMIN_PASSWORD
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t("adminHint")}</p>
          </div>

          {message ? <StatusMessage tone={message.tone} title={message.text} /> : null}
        </Card>
      </Reveal>

      <Reveal delayMs={70}>
        <div className="grid gap-3 lg:grid-cols-3">
          <Card className="space-y-2">
            <h2 className="font-semibold">{t("pubchemImport")}</h2>
            <Input type="number" value={pubchemStartCid} onChange={(e) => setPubchemStartCid(Number(e.target.value))} />
            <Input type="number" value={pubchemLimit} onChange={(e) => setPubchemLimit(Number(e.target.value))} />
            <Button onClick={() => run("pubchem")}>
              <UploadCloud size={14} />
              {t("startPubchem")}
            </Button>
          </Card>

          <Card className="space-y-2">
            <h2 className="font-semibold">{t("chebiImport")}</h2>
            <Input type="number" value={chebiLimit} onChange={(e) => setChebiLimit(Number(e.target.value))} />
            <Button onClick={() => run("chebi")}>
              <UploadCloud size={14} />
              {t("startChebi")}
            </Button>
          </Card>

          <Card className="space-y-2">
            <h2 className="font-semibold">{t("hmdbImport")}</h2>
            <Input value={hmdbFile} onChange={(e) => setHmdbFile(e.target.value)} />
            <Button onClick={() => run("hmdb")}>
              <UploadCloud size={14} />
              {t("startHmdb")}
            </Button>
          </Card>
        </div>
      </Reveal>

      <Reveal delayMs={120}>
        <div className="grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="space-y-3">
            <div className="flex items-center gap-2">
              <Database size={16} />
              <h2 className="font-semibold">{t("dataSection")}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="surface-subtle rounded-xl p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t("realData")}</p>
                <p className="mt-1 text-xl font-bold">{stats?.totals?.real ?? 0}</p>
              </div>
              <div className="surface-subtle rounded-xl p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t("demoData")}</p>
                <p className="mt-1 text-xl font-bold">{stats?.totals?.demo ?? 0}</p>
              </div>
            </div>
            <Button variant="outline" onClick={clearDemo}>
              <Shield size={14} />
              {t("clearDemo")}
            </Button>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">{t("jobs")}</h2>
            {jobs.length === 0 ? (
              <StatusMessage tone="info" title={t("jobsEmpty")} />
            ) : (
              <div className="space-y-2 text-sm">
                {jobs.map((job) => (
                  <div key={job._id} className="surface-subtle rounded-xl p-3">
                    <p className="font-semibold">
                      {job.source} / {job.status}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      read={job.totalRead} created={job.created} updated={job.updated} failed={job.failed}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </Reveal>
    </div>
  );
}
