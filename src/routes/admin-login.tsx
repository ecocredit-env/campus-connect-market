import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { bootstrapAdminAccount, checkIsAdmin } from "@/lib/admin.functions";
import { Shield, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin access · UltraOver" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const nav = useNavigate();
  const makeAdmin = useServerFn(bootstrapAdminAccount);
  const check = useServerFn(checkIsAdmin);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setSignedIn(true);
      try {
        const r = await check();
        if (r.isAdmin) nav({ to: "/admin" });
      } catch { /* ignore */ }
    })();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setBusy(false); return toast.error(error.message); }
    try {
      const r = await check();
      if (r.isAdmin) {
        toast.success("Welcome, admin");
        nav({ to: "/admin" });
      } else {
        setSignedIn(true);
        toast.message("Signed in. This account is not an admin yet.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not verify role");
    } finally {
      setBusy(false);
    }
  };

  const handleBootstrap = async () => {
    setBusy(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return toast.error("Sign in first.");
      const result = await makeAdmin();
      toast.success(result.message);
      nav({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bootstrap failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <div className="absolute -right-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 py-14">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-accent">
            <Shield className="h-3.5 w-3.5" /> Restricted access
          </p>
          <h1 className="display mt-2 text-5xl">Admin <span className="text-accent">Portal</span></h1>
          <p className="mt-3 max-w-lg text-sm text-primary-foreground/70">
            Sign in with an admin account to review pending college ID verifications and moderate the marketplace.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-md gap-6 px-6 py-12">
        <form onSubmit={handleSignIn} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <Label htmlFor="email">Admin email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={busy}>
            <ShieldCheck className="h-4 w-4" /> {busy ? "Verifying…" : "Sign in as admin"}
          </Button>
        </form>

        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm">
          <p className="font-medium text-foreground">First-time setup</p>
          <p className="mt-1 text-muted-foreground">
            No admin exists yet? Sign in above with the account you want to own this site, then promote it to admin (one-time only).
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            disabled={busy || !signedIn}
            onClick={handleBootstrap}
          >
            {signedIn ? "Promote this account to admin" : "Sign in first to enable"}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Not an admin?{" "}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Go to user sign-in
          </Link>
        </p>
      </div>
    </div>
  );
}
