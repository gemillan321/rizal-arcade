import { handleApiError, json, requireAdmin, temporaryPassword } from "../_lib/supabaseAdmin.js";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin(request);
    const body = await request.json() as { studentId?: unknown };
    const studentId = typeof body.studentId === "string" ? body.studentId.trim().toUpperCase() : "";
    if (!studentId) return json({ error: "Enter a Student ID." }, 400);
    const { data: profile, error } = await supabase
      .from("rizal_arcade_profiles")
      .select("id,student_id,display_name,section:rizal_arcade_sections(section_code)")
      .eq("student_id", studentId)
      .eq("role", "student")
      .single();
    if (error || !profile) return json({ error: "No active student account matches that Student ID." }, 404);
    const password = temporaryPassword();
    const { error: authError } = await supabase.auth.admin.updateUserById(profile.id, { password });
    if (authError) throw new Error(authError.message);
    const { error: profileError } = await supabase.from("rizal_arcade_profiles").update({ must_change_password: true, active: true }).eq("id", profile.id);
    if (profileError) throw new Error(profileError.message);
    const sectionValue = Array.isArray(profile.section) ? profile.section[0] : profile.section;
    return json({
      credential: {
        studentId: profile.student_id,
        displayName: profile.display_name,
        sectionCode: sectionValue?.section_code ?? "",
        temporaryPassword: password,
      },
      message: "The old password has been replaced. Give this temporary password only to the student.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export default { fetch: POST };
