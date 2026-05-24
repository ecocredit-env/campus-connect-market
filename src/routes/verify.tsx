import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Clock, XCircle } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify ID · UltraOver" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (!user) return null;

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Pick your college ID image first");
    if (file.size > 5 * 1024 * 1024) return toast.error("File must be under 5 MB");

    setBusy(true);
    const path = `${user.id}/id-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const { error: upErr } = await supabase.storage.from("id-documents").upload(path, file, { upsert: true });
    if (upErr) {
      setBusy(false);
      return toast.error(upErr.message);
    }
    const { error: pErr } = await supabase
      .from("profiles")
      .update({ id_document_path: path, verification_status: "pending" })
      .eq("id", user.id);
    setBusy(false);
    if (pErr) return toast.error(pErr.message);
    toast.success("Submitted — admin will review within 24–48 hours");
    await refreshProfile();
  };

  const status = profile?.verification_status ?? "pending";

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="display text-4xl text-primary">College ID verification</h1>
        <p className="mt-2 text-muted-foreground">
          We verify every seller and bidder using their college ID. Listings unlock once approved.
        </p>

        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-medium">Current status</span>
            <StatusBadge status={status} />
          </div>

          {status === "approved" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">You&apos;re a verified student. You can list items and place interest requests.</p>
              <Link to="/sell"><Button>Create your first listing →</Button></Link>
            </div>
          ) : status === "rejected" ? (
            <div className="space-y-3">
              <p className="text-sm">Your previous submission was rejected{profile?.verification_notes ? `: ${profile.verification_notes}` : "."}</p>
              <p className="text-sm text-muted-foreground">Please re‑upload a clearer image.</p>
              <UploadForm file={file} setFile={setFile} upload={upload} busy={busy} />
            </div>
          ) : profile?.id_document_path ? (
            <div className="space-y-3">
              <p className="text-sm">Your ID is queued for admin review. We&apos;ll notify you within 24–48 hours.</p>
              <p className="text-xs text-muted-foreground">Submitted file: {profile.id_document_path.split("/").pop()}</p>
              <UploadForm file={file} setFile={setFile} upload={upload} busy={busy} label="Replace upload" />
            </div>
          ) : (
            <UploadForm file={file} setFile={setFile} upload={upload} busy={busy} />
          )}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Your ID is stored privately. Only admins reviewing your account can see it.
        </p>
      </div>
    </div>
  );
}

function UploadForm({
  file, setFile, upload, busy, label = "Upload college ID",
}: { file: File | null; setFile: (f: File | null) => void; upload: (e: React.FormEvent) => void; busy: boolean; label?: string }) {
  return (
    <form onSubmit={upload} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="id-doc">{label} (JPG/PNG/PDF, max 5MB)</Label>
        <Input id="id-doc" type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
      </div>
      <Button type="submit" disabled={busy || !file}>{busy ? "Uploading…" : "Submit for review"}</Button>
    </form>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="gap-1 bg-success text-success-foreground"><ShieldCheck className="h-3 w-3" /> Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
  if (status === "suspended") return <Badge variant="destructive">Suspended</Badge>;
  return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending review</Badge>;
}
