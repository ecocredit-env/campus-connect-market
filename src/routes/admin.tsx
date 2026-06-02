import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { checkIsAdmin, listVerificationQueue, decideVerification, listAdminApplications, decideAdminApplication } from "@/lib/admin.functions";
import { toast } from "sonner";
import { ShieldCheck, Clock, XCircle, ExternalLink, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · UltraOver" }] }),
  component: AdminPage,
});

type Row = {
  id: string;
  full_name: string;
  college_email: string | null;
  registration_number: string | null;
  department: string | null;
  year_of_study: string | null;
  phone: string | null;
  verification_status: "pending" | "approved" | "rejected" | "suspended";
  verification_notes: string | null;
  id_document_path: string | null;
  signedUrl: string | null;
  created_at: string;
};

function AdminPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const check = useServerFn(checkIsAdmin);
  const list = useServerFn(listVerificationQueue);
  const decide = useServerFn(decideVerification);

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { nav({ to: "/login" }); return; }
    void (async () => {
      try {
        const r = await check();
        if (!r.isAdmin) { setAllowed(false); return; }
        setAllowed(true);
        await reload();
      } catch (e) {
        setAllowed(false);
        toast.error(e instanceof Error ? e.message : "Access denied");
      }
    })();
  }, [loading, user]);

  const reload = async () => {
    const { profiles } = await list();
    setRows(profiles as Row[]);
  };

  const act = async (row: Row, decision: "approved" | "rejected" | "suspended") => {
    setBusy(row.id);
    try {
      await decide({ data: { userId: row.id, decision, notes: notes[row.id] || undefined } });
      toast.success(`Marked ${decision}`);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  if (allowed === false) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="display text-3xl text-primary">Admins only</h1>
          <p className="mt-2 text-muted-foreground">Your account doesn&apos;t have admin access.</p>
        </div>
      </div>
    );
  }

  const pending = rows.filter(r => r.verification_status === "pending" && r.id_document_path);
  const reviewed = rows.filter(r => r.verification_status !== "pending");
  const noDoc = rows.filter(r => r.verification_status === "pending" && !r.id_document_path);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Crazy admin banner */}
      <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground grain">
        <div className="absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-accent/40 blur-3xl" />
        <div className="absolute right-10 top-4 h-40 w-40 rounded-full bg-accent/30 blur-2xl animate-pulse" />
        <div className="relative mx-auto max-w-7xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.4em] text-accent">/ Control room</p>
          <h1 className="display mt-2 text-5xl sm:text-6xl">
            ID <span className="text-accent">Registration</span> Desk
          </h1>
          <p className="mt-3 max-w-xl text-sm text-primary-foreground/70">
            Approve, reject, or suspend college ID submissions. Approved students unlock buying & selling.
          </p>
          <div className="mt-6 grid max-w-2xl grid-cols-3 gap-4">
            <KPI n={pending.length} label="Awaiting review" tone="accent" />
            <KPI n={rows.filter(r => r.verification_status === "approved").length} label="Approved" />
            <KPI n={rows.filter(r => r.verification_status === "rejected").length} label="Rejected" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {allowed === null ? (
          <p className="text-muted-foreground">Checking access…</p>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed ({reviewed.length})</TabsTrigger>
              <TabsTrigger value="nodoc">No document ({noDoc.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6 space-y-4">
              {pending.length === 0 ? <Empty msg="Inbox zero. ✨" /> :
                pending.map(r => (
                  <Card key={r.id} row={r} notes={notes} setNotes={setNotes} act={act} busy={busy === r.id} />
                ))}
            </TabsContent>

            <TabsContent value="reviewed" className="mt-6 space-y-4">
              {reviewed.length === 0 ? <Empty msg="No decisions yet" /> :
                reviewed.map(r => (
                  <Card key={r.id} row={r} notes={notes} setNotes={setNotes} act={act} busy={busy === r.id} />
                ))}
            </TabsContent>

            <TabsContent value="nodoc" className="mt-6 space-y-4">
              {noDoc.length === 0 ? <Empty msg="Everyone uploaded a document" /> :
                noDoc.map(r => (
                  <Card key={r.id} row={r} notes={notes} setNotes={setNotes} act={act} busy={busy === r.id} />
                ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function KPI({ n, label, tone }: { n: number; label: string; tone?: "accent" }) {
  return (
    <div className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-4 backdrop-blur">
      <p className={`display text-4xl ${tone === "accent" ? "text-accent" : "text-primary-foreground"}`}>{n}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-primary-foreground/60">{label}</p>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">{msg}</div>;
}

function StatusPill({ s }: { s: Row["verification_status"] }) {
  if (s === "approved") return <Badge className="gap-1 bg-success text-success-foreground"><ShieldCheck className="h-3 w-3" />Approved</Badge>;
  if (s === "rejected") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
  if (s === "suspended") return <Badge variant="destructive">Suspended</Badge>;
  return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
}

function Card({
  row, notes, setNotes, act, busy,
}: {
  row: Row;
  notes: Record<string, string>;
  setNotes: (n: Record<string, string>) => void;
  act: (r: Row, d: "approved" | "rejected" | "suspended") => void;
  busy: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 md:grid-cols-[200px_1fr]">
      <div className="relative h-44 overflow-hidden rounded-lg border border-border bg-muted">
        {row.signedUrl ? (
          row.signedUrl.endsWith(".pdf") ? (
            <a href={row.signedUrl} target="_blank" rel="noreferrer" className="grid h-full w-full place-items-center text-sm text-muted-foreground hover:text-primary">
              Open PDF <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          ) : (
            <a href={row.signedUrl} target="_blank" rel="noreferrer">
              <img src={row.signedUrl} alt="ID" className="h-full w-full object-cover transition hover:scale-105" />
            </a>
          )
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">No document</div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="display text-xl text-primary">{row.full_name}</h3>
            <p className="text-xs text-muted-foreground">{row.college_email ?? "—"}</p>
          </div>
          <StatusPill s={row.verification_status} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <Meta k="Reg. no." v={row.registration_number} />
          <Meta k="Dept." v={row.department} />
          <Meta k="Year" v={row.year_of_study} />
          <Meta k="Phone" v={row.phone} />
        </div>

        <Textarea
          placeholder="Optional note for the user (visible to them)"
          value={notes[row.id] ?? row.verification_notes ?? ""}
          onChange={(e) => setNotes({ ...notes, [row.id]: e.target.value })}
          className="min-h-[64px]"
        />

        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy} onClick={() => act(row, "approved")}>Approve</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => act(row, "rejected")}>Reject</Button>
          <Button size="sm" variant="destructive" disabled={busy} onClick={() => act(row, "suspended")}>Suspend</Button>
        </div>
      </div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string | null }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
      <p className="truncate">{v ?? "—"}</p>
    </div>
  );
}
