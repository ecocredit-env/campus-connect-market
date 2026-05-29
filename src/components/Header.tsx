import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Plus, User as UserIcon, Shield } from "lucide-react";
import ultraLogo from "@/assets/ultra-logo.jpeg";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={ultraLogo} alt="UltraOver" className="h-9 w-9 rounded-md object-cover" />
            <span className="display text-lg tracking-tight">ULTRAOVER<span className="text-accent">.</span></span>
          </Link>
          <ThemeToggle />
        </div>


        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/browse" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">Browse</Link>
          {user && (
            <Link to="/sell" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">Sell</Link>
          )}
          {user && (
            <Link to="/me" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">My Stuff</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="rounded-md px-3 py-2 text-sm font-medium text-accent hover:bg-muted">
              <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Admin</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {profile?.verification_status === "approved" && (
                <Badge variant="secondary" className="hidden gap-1 sm:inline-flex">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              )}
              {profile?.verification_status === "pending" && (
                <Link to="/verify">
                  <Badge variant="outline" className="hidden cursor-pointer sm:inline-flex">Verify ID</Badge>
                </Link>
              )}
              <Button size="sm" variant="ghost" onClick={() => void signOut().then(() => navigate({ to: "/" }))}>
                Sign out
              </Button>
              <Link to="/sell">
                <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> List item</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin-login" className="hidden sm:inline-flex">
                <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" /> Admin
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm" variant="ghost">Sign in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gap-1.5"><UserIcon className="h-4 w-4" /> Join</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
