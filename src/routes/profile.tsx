import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Clock, XCircle, Camera, Star, Package } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile · UltraOver" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    registration_number: "",
    department: "",
    year_of_study: "",
    bio: "",
    profile_photo: "",
  });

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        registration_number: profile.registration_number ?? "",
        department: profile.department ?? "",
        year_of_study: profile.year_of_study ?? "",
        bio: profile.bio ?? "",
        profile_photo: profile.profile_photo ?? "",
      });
    }
  }, [profile]);

  if (!user || !profile) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) return toast.error("Full name is required");
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        registration_number: form.registration_number.trim() || null,
        department: form.department.trim() || null,
        year_of_study: form.year_of_study.trim() || null,
        bio: form.bio.trim() || null,
        profile_photo: form.profile_photo || null,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    await refreshProfile();
  };

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return toast.error("Image must be under 3 MB");
    setUploading(true);
    const path = `${user.id}/avatar-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const { error: upErr } = await supabase.storage.from("listing-photos").upload(path, file, { upsert: true });
    if (upErr) {
      setUploading(false);
      return toast.error(upErr.message);
    }
    const { data: pub } = supabase.storage.from("listing-photos").getPublicUrl(path);
    setForm((f) => ({ ...f, profile_photo: pub.publicUrl }));
    setUploading(false);
    toast.success("Photo uploaded — don't forget to save");
  };

  const status = profile.verification_status;
  const initials = (profile.full_name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="display text-4xl text-primary">My Profile</h1>
            <p className="mt-1 text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <Button variant="ghost" size="sm" onClick={() => void signOut().then(() => nav({ to: "/" }))}>
              Sign out
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard icon={<Star className="h-4 w-4" />} label="Rating" value={profile.average_rating ? Number(profile.average_rating).toFixed(1) : "—"} />
          <StatCard icon={<Package className="h-4 w-4" />} label="Transactions" value={String(profile.total_transactions ?? 0)} />
          <StatCard icon={<ShieldCheck className="h-4 w-4" />} label="Status" value={status} />
        </div>

        {/* Avatar + form */}
        <form onSubmit={save} className="mt-8 space-y-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {form.profile_photo && <AvatarImage src={form.profile_photo} alt={form.full_name} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="photo" className="cursor-pointer">
                <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
                  <Camera className="h-4 w-4" /> {uploading ? "Uploading…" : "Change photo"}
                </span>
                <input id="photo" type="file" accept="image/*" className="hidden" onChange={onPhotoChange} disabled={uploading} />
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">JPG/PNG, max 3MB</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name *">
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required maxLength={120} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 9XXXXXXXXX" maxLength={20} />
            </Field>
            <Field label="College email">
              <Input value={profile.college_email ?? ""} disabled />
            </Field>
            <Field label="Registration number">
              <Input value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} maxLength={40} />
            </Field>
            <Field label="Department">
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. CSE" maxLength={60} />
            </Field>
            <Field label="Year of study">
              <Input value={form.year_of_study} onChange={(e) => setForm({ ...form, year_of_study: e.target.value })} placeholder="e.g. 2nd year" maxLength={20} />
            </Field>
          </div>

          <Field label="Bio">
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={300} placeholder="A short intro for buyers and sellers" />
          </Field>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
            <Link to="/me"><Button type="button" variant="outline">My listings & payouts</Button></Link>
            {status !== "approved" && (
              <Link to="/verify"><Button type="button" variant="outline">Verify college ID</Button></Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon} {label}</div>
      <div className="mt-1 text-lg font-semibold capitalize">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="gap-1 bg-success text-success-foreground"><ShieldCheck className="h-3 w-3" /> Verified</Badge>;
  if (status === "rejected") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
  if (status === "suspended") return <Badge variant="destructive">Suspended</Badge>;
  return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
}
