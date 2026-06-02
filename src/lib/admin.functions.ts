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

// ---------- Admin applications ----------

export const applyForAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { reason: string }) => {
    const reason = (d.reason ?? "").trim();
    if (reason.length < 10) throw new Error("Please write at least 10 characters explaining why");
    if (reason.length > 1000) throw new Error("Keep it under 1000 characters");
    return { reason };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { userId } = context;

    const { data: existingRole } = await supabaseAdmin
      .from("user_roles").select("id").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (existingRole) throw new Error("You are already an admin");

    const { data: existing } = await supabaseAdmin
      .from("admin_applications").select("id,status").eq("user_id", userId).maybeSingle();
    if (existing && existing.status === "pending") throw new Error("Your application is already pending review");

    if (existing) {
      const { error } = await supabaseAdmin
        .from("admin_applications")
        .update({ reason: data.reason, status: "pending", admin_notes: null, decided_at: null, decided_by: null })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("admin_applications")
        .insert({ user_id: userId, reason: data.reason });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const getMyAdminApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("admin_applications")
      .select("id,reason,status,admin_notes,created_at,decided_at")
      .eq("user_id", context.userId).maybeSingle();
    return { application: data ?? null };
  });

export const listAdminApplications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("admin_applications")
      .select("id,user_id,reason,status,admin_notes,created_at,decided_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = (data ?? []).map((a) => a.user_id);
    let profiles: Record<string, { full_name: string; college_email: string | null }> = {};
    if (ids.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles").select("id,full_name,college_email").in("id", ids);
      profiles = Object.fromEntries((profs ?? []).map((p) => [p.id, { full_name: p.full_name, college_email: p.college_email }]));
    }
    return {
      applications: (data ?? []).map((a) => ({
        ...a,
        applicant: profiles[a.user_id] ?? { full_name: "Unknown", college_email: null },
      })),
    };
  });

export const decideAdminApplication = createServerFn({ method: "POST" })
  .inputValidator((d: { applicationId: string; decision: "approved" | "rejected"; notes?: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { data: app, error: appErr } = await supabaseAdmin
      .from("admin_applications").select("id,user_id,status").eq("id", data.applicationId).maybeSingle();
    if (appErr) throw new Error(appErr.message);
    if (!app) throw new Error("Application not found");

    if (data.decision === "approved") {
      // Grant admin role (idempotent)
      const { data: existing } = await supabaseAdmin
        .from("user_roles").select("id").eq("user_id", app.user_id).eq("role", "admin").maybeSingle();
      if (!existing) {
        const { error: insErr } = await supabaseAdmin
          .from("user_roles").insert({ user_id: app.user_id, role: "admin" });
        if (insErr) throw new Error(insErr.message);
      }
    }

    const { error } = await supabaseAdmin
      .from("admin_applications")
      .update({
        status: data.decision,
        admin_notes: data.notes ?? null,
        decided_by: context.userId,
        decided_at: new Date().toISOString(),
      })
      .eq("id", data.applicationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Admin: delete listing ----------

export const adminDeleteListing = createServerFn({ method: "POST" })
  .inputValidator((d: { listingId: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    // Clean up dependent interest_requests first
    await supabaseAdmin.from("interest_requests").delete().eq("listing_id", data.listingId);
    const { error } = await supabaseAdmin.from("listings").delete().eq("id", data.listingId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
