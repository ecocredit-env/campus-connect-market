import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ListingCard, type ListingCardItem } from "@/components/ListingCard";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/me")({
  head: () => ({ meta: [{ title: "My Stuff · UltraOver" }] }),
  component: MePage,
});

type Req = {
  id: string;
  status: string;
  initial_message: string | null;
  created_at: string;
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
        .select("id,status,initial_message,created_at,listing:listings(id,title,price,photos),buyer:profiles!interest_requests_buyer_id_fkey(id,full_name,phone,college_email)")
        .eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("interest_requests")
        .select("id,status,initial_message,created_at,listing:listings(id,title,price,photos),seller:profiles!interest_requests_seller_id_fkey(id,full_name,phone,college_email)")
        .eq("buyer_id", user.id).order("created_at", { ascending: false }),
    ]);
    setMyListings((a.data ?? []) as ListingCardItem[]);
    setReceived((b.data ?? []) as unknown as Req[]);
    setSent((c.data ?? []) as unknown as Req[]);
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

        <Tabs defaultValue="listings" className="mt-8">
          <TabsList>
            <TabsTrigger value="listings">My listings ({myListings.length})</TabsTrigger>
            <TabsTrigger value="received">Received interest ({received.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent interest ({sent.length})</TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </div>
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
