import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · UltraOver" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    nav({ to: "/browse" });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto grid max-w-md gap-8 px-6 py-16">
        <div className="text-center">
          <h1 className="display text-4xl text-primary">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Welcome back to the campus marketplace.</p>
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">College email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>

        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-sm">
          <p className="text-muted-foreground">Are you a platform administrator?</p>
          <Link to="/admin-login" className="mt-1 inline-block font-medium text-primary underline-offset-4 hover:underline">
            Go to the Admin Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
