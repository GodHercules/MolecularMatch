"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useI18n } from "@/components/language-provider";

export default function AdminPage() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pubchemLimit, setPubchemLimit] = useState(5000);
  const [pubchemStartCid, setPubchemStartCid] = useState(1);
  const [chebiLimit, setChebiLimit] = useState(5000);
  const [hmdbFile, setHmdbFile] = useState("./data/hmdb_metabolites.xml");
  const [message, setMessage] = useState("");

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
    setMessage("");
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
      setMessage(t("importSuccess"));
      await refresh();
    } catch (error: any) {
      setMessage(error?.response?.data?.error?.message ?? t("importError"));
    }
  };

  const clearDemo = async () => {
    await api.delete("/admin/demo-data", { headers });
    await refresh();
  };

  return (
    <div className="space-y-4">
      <Card className="brand-panel space-y-2">
        <p className="section-kicker">06. {t("adminTitle")}</p>
        <h2 className="text-lg font-semibold">{t("adminTitle")}</h2>
        <Input
          type="password"
          placeholder="ADMIN_PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">{t("adminHint")}</p>
      </Card>

      <Card className="brand-panel space-y-2">
        <h3 className="font-semibold">{t("pubchemImport")}</h3>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Input type="number" value={pubchemStartCid} onChange={(e) => setPubchemStartCid(Number(e.target.value))} />
          <Input type="number" value={pubchemLimit} onChange={(e) => setPubchemLimit(Number(e.target.value))} />
        </div>
        <Button onClick={() => run("pubchem")}>{t("startPubchem")}</Button>
      </Card>

      <Card className="brand-panel space-y-2">
        <h3 className="font-semibold">{t("chebiImport")}</h3>
        <Input type="number" value={chebiLimit} onChange={(e) => setChebiLimit(Number(e.target.value))} />
        <Button onClick={() => run("chebi")}>{t("startChebi")}</Button>
      </Card>

      <Card className="brand-panel space-y-2">
        <h3 className="font-semibold">{t("hmdbImport")}</h3>
        <Input value={hmdbFile} onChange={(e) => setHmdbFile(e.target.value)} />
        <Button onClick={() => run("hmdb")}>{t("startHmdb")}</Button>
      </Card>

      <Card className="brand-panel space-y-2">
        <h3 className="font-semibold">{t("dataSection")}</h3>
        <p>
          {t("realData")}: {stats?.totals?.real ?? 0}
        </p>
        <p>
          {t("demoData")}: {stats?.totals?.demo ?? 0}
        </p>
        <Button variant="outline" onClick={clearDemo}>
          {t("clearDemo")}
        </Button>
      </Card>

      <Card className="brand-panel">
        <h3 className="mb-2 font-semibold">{t("jobs")}</h3>
        <div className="space-y-2 text-sm">
          {jobs.map((job) => (
            <div key={job._id} className="rounded border border-border p-2">
              <p>
                {job.source} / {job.status}
              </p>
              <p>
                read={job.totalRead} created={job.created} updated={job.updated} failed={job.failed}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
