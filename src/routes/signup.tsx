import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
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
