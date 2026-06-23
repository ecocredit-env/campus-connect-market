import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, User as UserIcon, Shield, LogOut, Package, Sparkles } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { VerificationBadges } from "@/components/VerificationBadges";

import { ThemeToggle } from "@/components/ThemeToggle";
import logoAsset from "@/assets/ultraover-mark.asset.json";

const NAV = [
  { to: "/browse", label: "Browse", authOnly: false },
  { to: "/sell", label: "Sell", authOnly: true },
] as const;

export function Header() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const logoTo = user ? "/browse" : "/";


  const initials = (profile?.full_name ?? user?.email ?? "U")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="pointer-events-auto mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full glass-nav px-3 sm:h-[68px] sm:px-4">
        {/* LOGO */}
        <Link to="/" className="group flex items-center gap-2.5 pl-1">
          <span className="jelly-orb relative flex h-10 w-10 items-center justify-center sm:h-11 sm:w-11">
            <img
              src={logoAsset.url}
              alt="UltraOver"
              className="h-9 w-9 object-contain sm:h-10 sm:w-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
              draggable={false}
            />
          </span>
          <span className="hidden text-[15px] font-semibold tracking-tight sm:inline-block">
            Ultra<span className="text-gradient-accent">Over</span>
          </span>
        </Link>

        {/* CENTER NAV — jelly pills */}
        <nav className="hidden items-center gap-2 md:flex">
          {NAV.filter((l) => !l.authOnly || !!user).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: false }}
              className="jelly rounded-full px-5 py-2 text-[13px] font-medium text-foreground/90"
              activeProps={{ "data-active": "true" } as any}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="jelly rounded-full px-5 py-2 text-[13px] font-medium text-accent"
            >
              <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Admin</span>
            </Link>
          )}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <>
              <Link to="/sell" className="hidden sm:inline-flex">
                <button className="jelly inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-foreground">
                  <Plus className="h-4 w-4" /> List
                </button>
              </Link>

              {/* Instagram-style round profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Profile menu"
                    className="jelly-orb relative flex h-10 w-10 items-center justify-center overflow-hidden"
                  >
                    {profile?.profile_photo ? (
                      <img src={profile.profile_photo} alt="Me" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[12px] font-bold tracking-wide text-foreground/95">
                        {initials}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="liquid-glass mt-1 w-64 rounded-2xl border-white/10 p-2 text-foreground"
                >
                  <DropdownMenuLabel className="px-3 pb-2 pt-3">
                    <div className="flex items-center gap-3">
                      <span className="jelly-orb flex h-10 w-10 items-center justify-center overflow-hidden">
                        {profile?.profile_photo ? (
                          <img src={profile.profile_photo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[11px] font-bold">{initials}</span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{profile?.full_name ?? "Welcome"}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <VerificationBadges
                        emailVerified={!!profile?.college_email_verified}
                        idVerified={profile?.verification_status === "approved"}
                        size="sm"
                      />
                      {profile?.verification_status !== "approved" && (
                        <Link to="/verify" className="mt-2 inline-block text-[11px] text-accent underline-offset-2 hover:underline">
                          Get ID verified →
                        </Link>
                      )}
                    </div>

                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link to="/me" className="flex w-full items-center gap-2 px-3 py-2 text-sm">
                      <Package className="h-4 w-4" /> My Stuff
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link to="/profile" className="flex w-full items-center gap-2 px-3 py-2 text-sm">
                      <UserIcon className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl md:hidden">
                    <Link to="/browse" className="flex w-full items-center gap-2 px-3 py-2 text-sm">
                      <Sparkles className="h-4 w-4" /> Browse
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl md:hidden">
                    <Link to="/sell" className="flex w-full items-center gap-2 px-3 py-2 text-sm">
                      <Plus className="h-4 w-4" /> Sell
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link to="/admin" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-accent">
                        <Shield className="h-4 w-4" /> Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    className="rounded-xl px-3 py-2 text-sm text-destructive focus:text-destructive"
                    onSelect={() => void signOut().then(() => navigate({ to: "/" }))}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/admin-login" className="hidden sm:inline-flex">
                <button className="jelly inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                </button>
              </Link>
              <Link to="/login">
                <button className="jelly rounded-full px-4 py-2 text-[13px] font-medium text-foreground">
                  Sign in
                </button>
              </Link>
              <Link to="/signup">
                <button className="jelly inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-foreground" data-active="true">
                  <UserIcon className="h-4 w-4" /> Join
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
