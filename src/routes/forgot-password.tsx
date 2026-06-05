import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password · UltraOver" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Reset link sent — check your inbox");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto grid max-w-md gap-6 px-6 py-16">
        <div className="text-center">
          <h1 className="display text-4xl text-primary">Forgot password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your account email and we&apos;ll send a reset link.
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-border bg-card p-6 text-sm">
            <p>If an account exists for <strong>{email}</strong>, a password reset link is on its way.</p>
            <p className="mt-2 text-muted-foreground">The link expires in 60 minutes.</p>
            <Link to="/login" className="mt-4 inline-block font-medium text-primary underline-offset-4 hover:underline">
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Remembered it?{" "}
              <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
