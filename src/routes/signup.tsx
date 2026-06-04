import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Join · UltraOver" }] }),
  component: SignupPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  registration_number: z.string().trim().min(2).max(40),
  department: z.string().trim().min(2).max(80),
});

function SignupPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    registration_number: "",
    department: "",
  });
  const [busy, setBusy] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: form.full_name },
      },
    });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }

    if (data.user) {
      // Fill profile details
      await supabase.from("profiles").update({
        full_name: form.full_name,
        registration_number: form.registration_number,
        department: form.department,
      }).eq("id", data.user.id);
    }

    setBusy(false);
    toast.success("Account created — now upload your college ID");
    nav({ to: "/verify" });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto grid max-w-md gap-6 px-6 py-12">
        <div>
          <h1 className="display text-4xl text-primary">Join UltraOver</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Step 1 — create your account. Step 2 — upload your college ID for verification.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
            if (r.error) { setBusy(false); return toast.error(r.error.message ?? "Google sign-in failed"); }
            if (r.redirected) return;
            nav({ to: "/verify" });
          }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or sign up with email</span></div>
        </div>

        <form onSubmit={handle} className="space-y-4">

          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">College email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password (8+ chars)</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="reg">Reg. number</Label>
              <Input id="reg" value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dept">Department</Label>
              <Input id="dept" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already a member?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
