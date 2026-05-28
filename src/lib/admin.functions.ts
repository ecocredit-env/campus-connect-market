import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin access required");
}

export const bootstrapAdminAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) throw new Error(countError.message);

    const { data: existingRole, error: roleReadError } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleReadError) throw new Error(roleReadError.message);

    if ((count ?? 0) > 0 && !existingRole) {
      throw new Error("An admin account already exists.");
    }

    if (!existingRole) {
      const { error: insertError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      if (insertError) throw new Error(insertError.message);
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        verification_status: "approved",
        verification_notes: "Approved during first-admin bootstrap",
        verified_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (profileError) throw new Error(profileError.message);

    return {
      ok: true,
      message: existingRole ? "Already an admin." : "This account is now the first admin.",
    };
  });

export const checkIsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const listVerificationQueue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id,full_name,college_email,registration_number,department,year_of_study,phone,verification_status,verification_notes,id_document_path,verified_at,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);

    const withUrls = await Promise.all(
      (data ?? []).map(async (p) => {
        let signedUrl: string | null = null;
        if (p.id_document_path) {
          const { data: s } = await supabaseAdmin.storage
            .from("id-documents")
            .createSignedUrl(p.id_document_path, 60 * 10);
          signedUrl = s?.signedUrl ?? null;
        }
        return { ...p, signedUrl };
      }),
    );
    return { profiles: withUrls };
  });

export const decideVerification = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string; decision: "approved" | "rejected" | "suspended"; notes?: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        verification_status: data.decision,
        verification_notes: data.notes ?? null,
        verified_at: data.decision === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
