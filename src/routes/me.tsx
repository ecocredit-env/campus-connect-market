import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ListingCard, type ListingCardItem } from "@/components/ListingCard";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { applyForAdmin, getMyAdminApplication } from "@/lib/admin.functions";
import { reconcileRazorpayPayment } from "@/lib/razorpay.functions";
import { toast } from "sonner";
import { Wallet, ShieldCheck, KeyRound, Package, Truck, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/me")({
  head: () => ({ meta: [{ title: "My Stuff · UltraOver" }] }),
  component: MePage,
});

type Req = {
  id: string;
  status: string;
  initial_message: string | null;
  created_at: string;
  buyer_id?: string;
  seller_id?: string;
  listing: { id: string; title: string; price: number; photos: string[] } | null;
  buyer: { id: string; full_name: string; phone: string | null; college_email: string | null } | null;
  seller: { id: string; full_name: string; phone: string | null; college_email: string | null } | null;
};

function MePage() {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const [myListings, setMyListings] = useState<ListingCardItem[]>([]);
  const [received, setReceived] = useState<Req[]>([]);
  const [sent, setSent] = useState<Req[]>([]);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
    if (user) void loadAll();
  }, [loading, user]);

  const loadAll = async () => {
    if (!user) return;
    const [a, b, c] = await Promise.all([
      supabase.from("listings").select("id,title,price,category,condition,photos,location").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("interest_requests")
        .select("id,status,initial_message,created_at,buyer_id,seller_id,listing:listings(id,title,price,photos)")
        .eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("interest_requests")
        .select("id,status,initial_message,created_at,buyer_id,seller_id,listing:listings(id,title,price,photos)")
        .eq("buyer_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (a.error || b.error || c.error) {
      toast.error(a.error?.message ?? b.error?.message ?? c.error?.message ?? "Could not load your dashboard");
      return;
    }

    const receivedRows = ((b.data ?? []) as Req[]);
    const sentRows = ((c.data ?? []) as Req[]);
    const counterpartyIds = Array.from(new Set([
      ...receivedRows.map((row) => row.buyer_id).filter(Boolean),
      ...sentRows.map((row) => row.seller_id).filter(Boolean),
    ])) as string[];

    const profileMap = new Map<string, Req["buyer"]>();

    if (counterpartyIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("public_profiles" as never)
        .select("id,full_name")
        .in("id", counterpartyIds);

      if (profilesError) {
        toast.error(profilesError.message);
        return;
      }

      for (const profile of (profiles ?? []) as Array<{ id: string; full_name: string }>) {
        profileMap.set(profile.id, { id: profile.id, full_name: profile.full_name, phone: null, college_email: null });
      }

      // For approved requests, fetch contact info via gated RPC
      const approvedCounterparties = Array.from(new Set([
        ...receivedRows.filter((r) => r.status === "approved").map((r) => r.buyer_id),
        ...sentRows.filter((r) => r.status === "approved").map((r) => r.seller_id),
      ])).filter(Boolean) as string[];

      for (const otherId of approvedCounterparties) {
        const { data: contact } = await supabase.rpc("get_counterparty_contact" as never, { _other_user: otherId } as never);
        const row = (Array.isArray(contact) ? contact[0] : null) as { full_name: string; phone: string | null; college_email: string | null } | null;
        if (row) {
          profileMap.set(otherId, { id: otherId, full_name: row.full_name, phone: row.phone, college_email: row.college_email });
        }
      }

    }

    setMyListings((a.data ?? []) as ListingCardItem[]);
    setReceived(receivedRows.map((row) => ({
      ...row,
      buyer: row.buyer_id ? profileMap.get(row.buyer_id) ?? null : null,
      seller: null,
    })));
    setSent(sentRows.map((row) => ({
      ...row,
      buyer: null,
      seller: row.seller_id ? profileMap.get(row.seller_id) ?? null : null,
    })));
  };


  const respond = async (id: string, status: "approved" | "rejected" | "blocked") => {
    const { error } = await supabase.from("interest_requests")
      .update({ status, responded_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Request ${status}`);
    void loadAll();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-4xl text-primary">My Stuff</h1>
            <p className="mt-1 text-muted-foreground">{profile?.full_name}</p>
          </div>
          {profile?.verification_status !== "approved" && (
            <Link to="/verify"><Button variant="outline">Complete verification</Button></Link>
          )}
        </div>

        <Tabs defaultValue="orders" className="mt-8">
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="orders"><Package className="mr-1 h-3.5 w-3.5" />My orders</TabsTrigger>
            <TabsTrigger value="listings">My listings ({myListings.length})</TabsTrigger>
            <TabsTrigger value="received">Received interest ({received.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent interest ({sent.length})</TabsTrigger>
            <TabsTrigger value="payout"><Wallet className="mr-1 h-3.5 w-3.5" />Payout</TabsTrigger>
            <TabsTrigger value="admin-apply"><ShieldCheck className="mr-1 h-3.5 w-3.5" />Become admin</TabsTrigger>
            <TabsTrigger value="password"><KeyRound className="mr-1 h-3.5 w-3.5" />Password</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <OrdersPanel userId={user.id} />
          </TabsContent>

          <TabsContent value="listings" className="mt-6">
            {myListings.length === 0 ? (
              <Empty cta />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myListings.map((i) => <ListingCard key={i.id} item={i} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="received" className="mt-6 space-y-3">
            {received.length === 0 ? <Empty msg="No interest requests yet" /> : received.map((r) => (
              <ReqCard key={r.id} req={r} side="seller" onRespond={respond} />
            ))}
          </TabsContent>

          <TabsContent value="sent" className="mt-6 space-y-3">
            {sent.length === 0 ? <Empty msg="You haven't expressed interest in anything yet" /> : sent.map((r) => (
              <ReqCard key={r.id} req={r} side="buyer" />
            ))}
          </TabsContent>

          <TabsContent value="payout" className="mt-6">
            <PayoutForm />
          </TabsContent>

          <TabsContent value="admin-apply" className="mt-6">
            <AdminApplicationForm />
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <ChangePasswordForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdminApplicationForm() {
  const { isAdmin } = useAuth();
  const apply = useServerFn(applyForAdmin);
  const get = useServerFn(getMyAdminApplication);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [app, setApp] = useState<{ status: string; reason: string; admin_notes: string | null; created_at: string; decided_at: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) { setLoading(false); return; }
    void (async () => {
      try { const r = await get(); setApp(r.application as typeof app); }
      catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [isAdmin]);

  if (isAdmin) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-6 text-sm">
        <p className="flex items-center gap-2 font-semibold text-success"><ShieldCheck className="h-4 w-4" /> You are already an admin.</p>
        <Link to="/admin"><Button variant="outline" className="mt-4">Open Admin Console</Button></Link>
      </div>
    );
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await apply({ data: { reason } });
      toast.success("Application submitted — an admin will review it soon");
      const r = await get();
      setApp(r.application as typeof app);
      setReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-xl space-y-4">
      {app && (
        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Your application</p>
            <Badge variant={app.status === "approved" ? "secondary" : app.status === "rejected" ? "destructive" : "outline"} className="capitalize">{app.status}</Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Submitted {new Date(app.created_at).toLocaleDateString()}</p>
          <p className="mt-2 italic">&ldquo;{app.reason}&rdquo;</p>
          {app.admin_notes && <p className="mt-2 text-xs"><strong>Admin note:</strong> {app.admin_notes}</p>}
        </div>
      )}

      {(!app || app.status === "rejected") && (
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-6">
          <h2 className="display text-2xl text-primary">Apply to be an admin</h2>
          <p className="text-sm text-muted-foreground">
            Admins moderate listings, verify student IDs, and approve interest requests. Tell us why you're a good fit.
          </p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="I'm involved in campus tech club, available 1h/day, etc. (min 10 chars)"
            minLength={10}
            maxLength={1000}
            className="min-h-[120px]"
            required
          />
          <Button type="submit" disabled={busy}>{busy ? "Submitting…" : app?.status === "rejected" ? "Re-apply" : "Submit application"}</Button>
        </form>
      )}
    </div>
  );
}

function PayoutForm() {
  const { user, profile, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    payout_account_holder: profile?.payout_account_holder ?? "",
    payout_bank_name: profile?.payout_bank_name ?? "",
    payout_account_number: profile?.payout_account_number ?? "",
    payout_ifsc: profile?.payout_ifsc ?? "",
    payout_upi_id: profile?.payout_upi_id ?? "",
  });

  useEffect(() => {
    setForm({
      payout_account_holder: profile?.payout_account_holder ?? "",
      payout_bank_name: profile?.payout_bank_name ?? "",
      payout_account_number: profile?.payout_account_number ?? "",
      payout_ifsc: profile?.payout_ifsc ?? "",
      payout_upi_id: profile?.payout_upi_id ?? "",
    });
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.payout_account_holder.trim()) return toast.error("Account holder name is required");
    if (!form.payout_upi_id.trim() && !form.payout_account_number.trim()) {
      return toast.error("Enter at least UPI ID or bank account number");
    }
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      payout_account_holder: form.payout_account_holder.trim(),
      payout_bank_name: form.payout_bank_name.trim() || null,
      payout_account_number: form.payout_account_number.trim() || null,
      payout_ifsc: form.payout_ifsc.trim().toUpperCase() || null,
      payout_upi_id: form.payout_upi_id.trim() || null,
    }).eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Payout details saved");
    await refreshProfile();
  };

  return (
    <form onSubmit={save} className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="display text-2xl text-primary">Seller payout details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We send your earnings here after a sale. Provide at least UPI <em>or</em> bank account.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Account holder name *</Label>
        <Input value={form.payout_account_holder} onChange={(e) => setForm({ ...form, payout_account_holder: e.target.value })} required maxLength={120} />
      </div>

      <div className="space-y-1.5">
        <Label>UPI ID</Label>
        <Input value={form.payout_upi_id} onChange={(e) => setForm({ ...form, payout_upi_id: e.target.value })} placeholder="yourname@okhdfc" maxLength={80} />
      </div>

      <div className="relative my-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> OR bank account <span className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-1.5">
        <Label>Bank name</Label>
        <Input value={form.payout_bank_name} onChange={(e) => setForm({ ...form, payout_bank_name: e.target.value })} placeholder="e.g. HDFC Bank" maxLength={80} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Account number</Label>
          <Input value={form.payout_account_number} onChange={(e) => setForm({ ...form, payout_account_number: e.target.value })} maxLength={30} />
        </div>
        <div className="space-y-1.5">
          <Label>IFSC code</Label>
          <Input value={form.payout_ifsc} onChange={(e) => setForm({ ...form, payout_ifsc: e.target.value.toUpperCase() })} maxLength={11} />
        </div>
      </div>

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Saving…" : "Save payout details"}
      </Button>
    </form>
  );
}

function Empty({ msg = "Nothing to show", cta = false }: { msg?: string; cta?: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-20 text-center">
      <p className="text-muted-foreground">{msg}</p>
      {cta && <Link to="/sell"><Button className="mt-4">Create your first listing</Button></Link>}
    </div>
  );
}

function ReqCard({
  req, side, onRespond,
}: { req: Req; side: "buyer" | "seller"; onRespond?: (id: string, s: "approved" | "rejected" | "blocked") => void }) {
  const counter = side === "seller" ? req.buyer : req.seller;
  const showContact = req.status === "approved";

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
        {req.listing?.photos[0] && <img src={req.listing.photos[0]} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <Link to="/listing/$id" params={{ id: req.listing?.id ?? "" }} className="font-semibold hover:underline">
          {req.listing?.title}
        </Link>
        <p className="text-xs text-muted-foreground">
          {side === "seller" ? "From " : "To "}{counter?.full_name ?? "—"} · ₹{Number(req.listing?.price ?? 0).toLocaleString("en-IN")}
        </p>
        {req.initial_message && <p className="mt-1 text-sm italic text-muted-foreground">&ldquo;{req.initial_message}&rdquo;</p>}
        {showContact && counter && (
          <p className="mt-1 text-xs">
            Contact: {counter.college_email ?? "—"}{counter.phone ? ` · ${counter.phone}` : ""}
          </p>
        )}
      </div>
      <Badge variant={req.status === "approved" ? "secondary" : req.status === "rejected" ? "destructive" : "outline"} className="capitalize">
        {req.status}
      </Badge>
      {side === "seller" && req.status === "pending" && onRespond && (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onRespond(req.id, "approved")}>Approve</Button>
          <Button size="sm" variant="outline" onClick={() => onRespond(req.id, "rejected")}>Reject</Button>
        </div>
      )}
    </div>
  );
}

function ChangePasswordForm() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (next.length < 8) return toast.error("New password must be at least 8 characters");
    if (next !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    // Re-authenticate to confirm the current password.
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
    if (signInErr) {
      setBusy(false);
      return toast.error("Current password is incorrect");
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (error) return toast.error(error.message);
    setCurrent(""); setNext(""); setConfirm("");
    toast.success("Password updated");
  };

  const sendReset = async () => {
    if (!user?.email) return;
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setResetSent(true);
    toast.success("Reset link sent to your email");
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h3 className="display text-xl text-primary">Change password</h3>
        <div className="space-y-1.5">
          <Label htmlFor="cur">Current password</Label>
          <Input id="cur" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="np">New password</Label>
          <Input id="np" type="password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp">Confirm new password</Label>
          <Input id="cp" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy}>{busy ? "Updating…" : "Update password"}</Button>
      </form>

      <div className="space-y-3 rounded-xl border border-dashed border-border bg-muted/30 p-6">
        <h3 className="display text-xl text-primary">Forgot it?</h3>
        <p className="text-sm text-muted-foreground">We&apos;ll email you a secure reset link.</p>
        <Button variant="outline" onClick={sendReset} disabled={busy || resetSent}>
          {resetSent ? "Link sent ✓" : "Email me a reset link"}
        </Button>
      </div>
    </div>
  );
}
