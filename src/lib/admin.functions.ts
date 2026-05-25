import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const bootstrapAdminAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) {
      throw new Error(countError.message);
    }

    const { data: existingRole, error: roleReadError } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleReadError) {
      throw new Error(roleReadError.message);
    }

    if ((count ?? 0) > 0 && !existingRole) {
      throw new Error("An admin account already exists. Sign in with that account or promote another user from the backend.");
    }

    if (!existingRole) {
      const { error: insertError } = await supabaseAdmin.from("user_roles").insert({
        user_id: userId,
        role: "admin",
      });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        verification_status: "approved",
        verification_notes: "Approved during first-admin bootstrap",
        verified_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      throw new Error(profileError.message);
    }

    return {
      ok: true,
      message: existingRole
        ? "This account is already an admin."
        : "This account is now the first admin.",
    };
  });