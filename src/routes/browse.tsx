import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { ListingCard, type ListingCardItem } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Search } from "lucide-react";

export const Route = createFileRoute("/browse")({
  head: () => ({ meta: [{ title: "Browse · UltraOver" }] }),
  component: BrowsePage,
});

function BrowsePage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<ListingCardItem[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState("recent");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { setBusy(false); return; }
    void load();
  }, [loading, user, cat, sort]);

  const load = async () => {
    setBusy(true);
    let query = supabase.from("listings").select("id,title,price,category,condition,photos,location").eq("status", "active");
    if (cat !== "all") query = query.eq("category", cat as "cycles" | "coolers" | "electronics");
    if (sort === "price_low") query = query.order("price", { ascending: true });
    else if (sort === "price_high") query = query.order("price", { ascending: false });
    else query = query.order("created_at", { ascending: false });
    const { data, error } = await query.limit(60);
    setBusy(false);
    if (error) return;
    setItems((data ?? []) as ListingCardItem[]);
  };

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const needle = q.toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(needle));
  }, [items, q]);

  if (!loading && !user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="display text-3xl text-primary">Sign in to browse</h1>
          <p className="mt-2 text-muted-foreground">Listings are only visible to verified students.</p>
          <a href="/login"><Button className="mt-6">Sign in</Button></a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="display text-4xl text-primary sm:text-5xl">Browse</h1>
          <p className="mt-1 text-muted-foreground">All listings from verified students on campus.</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search title, brand…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="cycles">Cycles</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="coolers">Coolers</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently listed</SelectItem>
                <SelectItem value="price_low">Price: low → high</SelectItem>
                <SelectItem value="price_high">Price: high → low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {busy ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-24 text-center">
            <p className="display text-2xl text-primary">No listings yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Be the first to list — head to Sell.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => <ListingCard key={item.id} item={item} />)}
          </div>
        )}
      </section>
    </div>
  );
}
