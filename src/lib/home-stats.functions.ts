import { createServerFn } from "@tanstack/react-start";

export type HomeStats = {
  students: number;
  listings: number;
  tradedRupees: number;
  campuses: number;
  avgVerificationMinutes: number | null;
  ticker: string[];
};

export const getHomeStats = createServerFn({ method: "GET" }).handler(async (): Promise<HomeStats> => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [studentsRes, listingsRes, tradedRes, verifyRes, recentListingsRes, recentOrdersRes] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "approved"),
    supabaseAdmin
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabaseAdmin
      .from("orders")
      .select("amount_paid")
      .in("status", ["paid", "completed", "delivered"]),
    supabaseAdmin
      .from("profiles")
      .select("created_at, verified_at")
      .eq("verification_status", "approved")
      .not("verified_at", "is", null)
      .order("verified_at", { ascending: false })
      .limit(50),
    supabaseAdmin
      .from("listings")
      .select("title, seller_id, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("orders")
      .select("buyer_id, listing_id, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const tradedRupees =
    tradedRes.data?.reduce((sum, o) => sum + Number(o.amount_paid ?? 0), 0) ?? 0;

  let avgVerificationMinutes: number | null = null;
  if (verifyRes.data && verifyRes.data.length > 0) {
    const totals = verifyRes.data
      .map((p) => {
        if (!p.verified_at || !p.created_at) return null;
        return (new Date(p.verified_at).getTime() - new Date(p.created_at).getTime()) / 60000;
      })
      .filter((v): v is number => v != null && v >= 0);
    if (totals.length > 0) {
      avgVerificationMinutes = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
    }
  }

  // Build ticker — resolve names via profiles
  const userIds = new Set<string>();
  recentListingsRes.data?.forEach((l) => userIds.add(l.seller_id));
  recentOrdersRes.data?.forEach((o) => userIds.add(o.buyer_id));
  const listingIds = new Set<string>();
  recentOrdersRes.data?.forEach((o) => listingIds.add(o.listing_id));

  const [profilesRes, listingTitlesRes] = await Promise.all([
    userIds.size
      ? supabaseAdmin.from("profiles").select("id, full_name").in("id", Array.from(userIds))
      : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
    listingIds.size
      ? supabaseAdmin.from("listings").select("id, title").in("id", Array.from(listingIds))
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const nameById = new Map((profilesRes.data ?? []).map((p) => [p.id, p.full_name]));
  const titleById = new Map((listingTitlesRes.data ?? []).map((l) => [l.id, l.title]));

  const events: { ts: number; text: string }[] = [];
  recentListingsRes.data?.forEach((l) => {
    const name = nameById.get(l.seller_id)?.split(" ")[0] ?? "A student";
    events.push({ ts: new Date(l.created_at).getTime(), text: `${name} listed ${l.title}` });
  });
  recentOrdersRes.data?.forEach((o) => {
    const name = nameById.get(o.buyer_id)?.split(" ")[0] ?? "A student";
    const title = titleById.get(o.listing_id) ?? "an item";
    events.push({ ts: new Date(o.created_at).getTime(), text: `${name} bought ${title}` });
  });
  events.sort((a, b) => b.ts - a.ts);
  const ticker = events.slice(0, 8).map((e) => e.text);

  return {
    students: studentsRes.count ?? 0,
    listings: listingsRes.count ?? 0,
    tradedRupees,
    campuses: 6,
    avgVerificationMinutes,
    ticker,
  };
});
