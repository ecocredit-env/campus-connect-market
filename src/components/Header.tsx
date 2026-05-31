import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Plus, User as UserIcon, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="pointer-events-auto mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl glass-nav px-3 sm:h-16 sm:px-5">
        <div className="flex items-center gap-3">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-[oklch(0.68_0.18_295)] text-[11px] font-bold text-accent-foreground shadow-[0_0_24px_-4px_var(--glow-accent)] transition-transform group-hover:scale-105">
              U
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Ultra<span className="text-gradient-accent">Over</span>
            </span>
          </Link>
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <ThemeToggle />
        </div>

        <nav className="hidden items-center gap-0.5 md:flex">
          {[
            { to: "/browse", label: "Browse", show: true },
            { to: "/sell", label: "Sell", show: !!user },
            { to: "/me", label: "My Stuff", show: !!user },
            { to: "/profile", label: "Profile", show: !!user },
          ]
            .filter((l) => l.show)
            .map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent/10"
            >
              <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Admin</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {profile?.verification_status === "approved" && (
                <Badge variant="secondary" className="hidden gap-1 border-white/10 bg-white/5 backdrop-blur sm:inline-flex">
                  <ShieldCheck className="h-3 w-3 text-accent" /> Verified
                </Badge>
              )}
              {profile?.verification_status === "pending" && (
                <Link to="/verify">
                  <Badge variant="outline" className="hidden cursor-pointer border-white/15 bg-white/5 sm:inline-flex">Verify ID</Badge>
                </Link>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => void signOut().then(() => navigate({ to: "/" }))}
              >
                Sign out
              </Button>
              <Link to="/sell">
                <Button size="sm" className="gap-1.5 rounded-full bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="h-4 w-4" /> List
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin-login" className="hidden sm:inline-flex">
                <Button size="sm" variant="ghost" className="gap-1.5 rounded-full text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gap-1.5 rounded-full bg-foreground text-background hover:bg-foreground/90">
                  <UserIcon className="h-4 w-4" /> Join
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
