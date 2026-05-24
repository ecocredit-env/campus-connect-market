import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { X } from "lucide-react";

export const Route = createFileRoute("/sell")({
  head: () => ({ meta: [{ title: "List an item · UltraOver" }] }),
  component: SellPage,
});

const schema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(10).max(2000),
  category: z.enum(["cycles", "coolers", "electronics"]),
  condition: z.enum(["new", "like_new", "good", "fair", "poor"]),
  brand: z.string().trim().max(60).optional(),
  model: z.string().trim().max(60).optional(),
  manufacturing_year: z.coerce.number().int().min(1990).max(2030).optional(),
  original_price: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(0).max(1_000_000),
  location: z.string().trim().max(120).optional(),
});

function SellPage() {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "cycles", condition: "good",
    brand: "", model: "", manufacturing_year: "", original_price: "",
    price: "", location: "",
  });

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (!user) return null;

  if (profile && profile.verification_status !== "approved") {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <h1 className="display text-3xl text-primary">Verify your ID to start selling</h1>
          <p className="mt-2 text-muted-foreground">
            Only verified students can create listings. Status: <strong>{profile.verification_status}</strong>.
          </p>
          <Link to="/verify"><Button className="mt-6">Go to verification</Button></Link>
        </div>
      </div>
    );
  }

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, 5);
    setFiles(next);
  };

  const removeFile = (idx: number) => setFiles(files.filter((_, i) => i !== idx));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      ...form,
      manufacturing_year: form.manufacturing_year || undefined,
      original_price: form.original_price || undefined,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (files.length === 0) return toast.error("Add at least one photo");

    setBusy(true);
    try {
      // Upload photos
      const urls: string[] = [];
      for (const f of files) {
        if (f.size > 5 * 1024 * 1024) throw new Error(`${f.name} is over 5MB`);
        const path = `${user.id}/${Date.now()}-${f.name.replace(/[^a-z0-9.]/gi, "_")}`;
        const { error } = await supabase.storage.from("listing-photos").upload(path, f);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("listing-photos").getPublicUrl(path);
        urls.push(publicUrl);
      }

      const d = parsed.data;
      const { data: inserted, error: insErr } = await supabase
        .from("listings")
        .insert({
          seller_id: user.id,
          title: d.title,
          description: d.description,
          category: d.category,
          condition: d.condition,
          brand: d.brand || null,
          model: d.model || null,
          manufacturing_year: d.manufacturing_year ?? null,
          original_price: d.original_price ?? null,
          price: d.price,
          location: d.location || null,
          photos: urls,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      toast.success("Listing published");
      nav({ to: "/listing/$id", params: { id: inserted.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="display text-4xl text-primary">List an item</h1>
        <p className="mt-2 text-muted-foreground">Be honest about condition — your trust score depends on it.</p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Hercules MTB 26&quot; — 2022" required />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cycles">Cycles</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="coolers">Coolers</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Condition">
              <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like_new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Description">
            <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Condition details, defects, time used, what's included…" required />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand"><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Field>
            <Field label="Model"><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Year"><Input type="number" value={form.manufacturing_year} onChange={(e) => setForm({ ...form, manufacturing_year: e.target.value })} /></Field>
            <Field label="Original ₹"><Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} /></Field>
            <Field label="Selling ₹"><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></Field>
          </div>

          <Field label="Pickup location on campus">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Hostel Block C / Main Gate" />
          </Field>

          <Field label={`Photos (${files.length}/5)`}>
            <Input type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} disabled={files.length >= 5} />
            {files.length > 0 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded border border-border bg-muted">
                    <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeFile(i)} className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-background/90 text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Publishing…" : "Publish listing"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
