import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Check, Clock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/listing/$id")({
  head: () => ({ meta: [{ title: "Listing · UltraOver" }] }),
  component: ListingPage,
});

type Listing = {
  id: string; seller_id: string; title: string; description: string;
  category: string; subcategory: string | null; condition: string;
  brand: string | null; model: string | null; manufacturing_year: number | null;
  original_price: number | null; price: number; photos: string[];
  location: string | null; delivery_option: string; status: string; created_at: string;
  delivery_charge_note: string | null;
};

type Seller = { full_name: string; verification_status: string; total_transactions: number; average_rating: number | null };

function ListingPage() {
  const { id } = useParams({ from: "/listing/$id" });
  const { user } = useAuth();
  const nav = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [interest, setInterest] = useState<{ id: string; status: string } | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => { void load(); }, [id, user]);

  const load = async () => {
    setLoading(true);
    const { data: l } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
    if (!l) { setLoading(false); return; }
    setListing(l as Listing);
    const { data: s } = await supabase.from("public_profiles" as never)
      .select("full_name,verification_status,total_transactions,average_rating")
      .eq("id", l.seller_id).maybeSingle();
    setSeller(s as unknown as Seller);

    if (user && user.id !== l.seller_id) {
      const { data: ir } = await supabase.from("interest_requests")
        .select("id,status").eq("listing_id", id).eq("buyer_id", user.id).maybeSingle();
      if (ir) setInterest(ir);
    }
    setLoading(false);
  };

  const expressInterest = async () => {
    if (!user || !listing) return;
    setBusy(true);
    const { data, error } = await supabase.from("interest_requests").insert({
      listing_id: listing.id, buyer_id: user.id, seller_id: listing.seller_id,
      initial_message: msg.trim() || null,
    }).select("id,status").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    setInterest(data);
    toast.success("Interest sent — the seller will respond shortly");
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-6xl animate-pulse px-6 py-12">
          <div className="aspect-[4/3] rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="display text-3xl text-primary">Listing not found</h1>
          <Link to="/browse"><Button className="mt-6">Back to browse</Button></Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === listing.seller_id;
  const photo = listing.photos[activePhoto];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <button onClick={() => nav({ to: "/browse" })} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* gallery */}
          <div>
            <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
              {photo ? <img src={photo} alt={listing.title} className="h-full w-full object-cover" /> : null}
            </div>
            {listing.photos.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {listing.photos.map((p, i) => (
                  <button key={i} onClick={() => setActivePhoto(i)} className={`aspect-square overflow-hidden rounded border-2 ${i === activePhoto ? "border-accent" : "border-transparent"}`}>
                    <img src={p} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* detail */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">{listing.category}</Badge>
              <Badge variant="secondary" className="capitalize">{listing.condition.replace("_", " ")}</Badge>
              {listing.status !== "active" && <Badge variant="destructive">{listing.status}</Badge>}
            </div>

            <h1 className="display text-4xl text-primary sm:text-5xl">{listing.title}</h1>
            <div className="flex items-baseline gap-3">
              <span className="display text-3xl">₹{Number(listing.price).toLocaleString("en-IN")}</span>
              {listing.original_price && (
                <span className="text-sm text-muted-foreground line-through">₹{Number(listing.original_price).toLocaleString("en-IN")}</span>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-4 text-sm">
              {listing.brand && <><dt className="text-muted-foreground">Brand</dt><dd>{listing.brand}</dd></>}
              {listing.model && <><dt className="text-muted-foreground">Model</dt><dd>{listing.model}</dd></>}
              {listing.manufacturing_year && <><dt className="text-muted-foreground">Year</dt><dd>{listing.manufacturing_year}</dd></>}
              {listing.location && <><dt className="text-muted-foreground">Location</dt><dd className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.location}</dd></>}
            </dl>

            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h3>
              <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{listing.description}</p>
            </div>

            {/* Delivery info */}
            <div className="rounded-lg border border-border bg-mist/50 p-3 text-xs">
              <p className="font-semibold uppercase tracking-wider text-muted-foreground">Delivery</p>
              {listing.category === "coolers" ? (
                <p className="mt-1">
                  Variable delivery charge to hostel — paid by buyer.
                  {listing.delivery_charge_note && <> Seller's estimate: <strong>{listing.delivery_charge_note}</strong></>}
                </p>
              ) : (
                <p className="mt-1">✓ Free delivery to your hostel</p>
              )}
            </div>

            {seller && (
              <div className="rounded-lg border border-border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{seller.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {seller.total_transactions} sales · ★ {seller.average_rating ?? "—"}
                    </p>
                  </div>
                  {seller.verification_status === "approved" && (
                    <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" /> Verified</Badge>
                  )}
                </div>
              </div>
            )}

            {/* Action */}
            {!user ? (
              <Link to="/login"><Button size="lg" className="w-full">Sign in to contact seller</Button></Link>
            ) : isOwner ? (
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                This is your listing.
              </div>
            ) : interest ? (
              <div className="rounded-lg border border-border bg-card p-4 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  {interest.status === "pending" && <><Clock className="h-4 w-4 text-warning" /> Awaiting seller response</>}
                  {interest.status === "approved" && <><Check className="h-4 w-4 text-success" /> Seller approved — check My Stuff for contact details</>}
                  {interest.status === "rejected" && "Seller declined this request"}
                  {interest.status === "blocked" && "Contact blocked by seller"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea placeholder="Optional message (max 500 chars)" maxLength={500} value={msg} onChange={(e) => setMsg(e.target.value)} />
                <Button size="lg" className="w-full" onClick={expressInterest} disabled={busy}>
                  {busy ? "Sending…" : "I'm interested"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
