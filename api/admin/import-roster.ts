import type { ParsedRoster, RosterStudent } from "../../app/roster.js";
import { findAuthUserByEmail, handleApiError, json, normalizeStudentId, requireAdmin, studentAuthEmail, temporaryPassword } from "../_lib/supabaseAdmin.js";

type ImportRequest = Omit<ParsedRoster, "fileName">;

function clean(value: unknown, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validateStudent(value: unknown): RosterStudent {
  const student = (value ?? {}) as Partial<RosterStudent>;
  const result = {
    studentId: normalizeStudentId(clean(student.studentId, 50)),
    lastName: clean(student.lastName, 100),
    firstName: clean(student.firstName, 100),
    middleName: clean(student.middleName, 100),
    courseCode: clean(student.courseCode, 50),
    email: clean(student.email, 254).toLowerCase(),
  };
  if (!result.studentId || !result.lastName || !result.firstName) throw new Error("Every roster row needs a Student ID, first name, and last name.");
  return result;
}

function displayName(student: RosterStudent) {
  const initial = student.lastName.charAt(0).toUpperCase();
  return `${student.firstName}${initial ? ` ${initial}.` : ""}`;
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin(request);
    const body = await request.json() as Partial<ImportRequest> & { regeneratePendingPasswords?: unknown };
    const sectionCode = clean(body.sectionCode, 80);
    const schoolYear = clean(body.schoolYear, 30);
    const term = clean(body.term, 30);
    const regeneratePendingPasswords = body.regeneratePendingPasswords === true;
    if (!sectionCode || !schoolYear || !term) return json({ error: "Section, school year, and term are required." }, 400);
    if (!Array.isArray(body.students) || body.students.length < 1 || body.students.length > 250) return json({ error: "The roster must contain 1–250 students." }, 400);
    const students = body.students.map(validateStudent);
    const uniqueIds = new Set(students.map((student) => student.studentId.toLowerCase()));
    if (uniqueIds.size !== students.length) return json({ error: "The roster contains duplicate Student IDs." }, 400);

    const { data: section, error: sectionError } = await supabase
      .from("rizal_arcade_sections")
      .upsert({
        section_code: sectionCode,
        school_year: schoolYear,
        term,
        subject_code: clean(body.subjectCode, 40) || "RIZLIFE",
        subject_name: clean(body.subjectName, 160) || "Life and Works of Rizal",
        instructor_name: clean(body.instructor, 160),
        active: true,
      }, { onConflict: "section_code,school_year,term" })
      .select("id,section_code")
      .single();
    if (sectionError || !section) throw new Error(sectionError?.message ?? "The section could not be created.");

    const { data: existingProfiles, error: existingError } = await supabase
      .from("rizal_arcade_profiles")
      .select("id,student_id,must_change_password")
      .in("student_id", students.map((student) => student.studentId));
    if (existingError) throw new Error(existingError.message);
    const existingById = new Map((existingProfiles ?? []).map((profile) => [String(profile.student_id).toLowerCase(), profile]));

    const credentials: Array<{ studentId: string; displayName: string; sectionCode: string; temporaryPassword: string }> = [];
    const errors: Array<{ studentId: string; error: string }> = [];
    const skipped: Array<{ studentId: string; reason: string }> = [];
    let createdCount = 0;
    let recovered = 0;
    let updated = 0;
    for (const student of students) {
      try {
        const existingProfile = existingById.get(student.studentId.toLowerCase());
        const profile = {
          student_id: student.studentId,
          first_name: student.firstName,
          middle_name: student.middleName,
          last_name: student.lastName,
          display_name: displayName(student),
          roster_email: student.email || null,
          course_code: student.courseCode,
          section_id: section.id,
          role: "student",
          active: true,
        };
        if (existingProfile) {
          const profileId = String(existingProfile.id);
          const { error } = await supabase.from("rizal_arcade_profiles").update(profile).eq("id", profileId);
          if (error) throw new Error(`Could not update ${student.studentId}: ${error.message}`);
          if (existingProfile.must_change_password && regeneratePendingPasswords) {
            const password = temporaryPassword();
            const { error: resetError } = await supabase.auth.admin.updateUserById(profileId, { password });
            if (resetError) throw new Error(`Could not recover ${student.studentId}: ${resetError.message}`);
            credentials.push({ studentId: student.studentId, displayName: profile.display_name, sectionCode: section.section_code, temporaryPassword: password });
            recovered += 1;
          }
          updated += 1;
          continue;
        }

        const password = temporaryPassword();
        const loginEmail = studentAuthEmail(student.studentId);
        const { data: created, error: createError } = await supabase.auth.admin.createUser({
          email: loginEmail,
          password,
          email_confirm: true,
          user_metadata: { student_id: student.studentId, display_name: profile.display_name },
        });

        if (created.user) {
          // We just created this auth user, so `password` is already its real password. Insert the profile now;
          // rizal_arcade_profiles.student_id is unique, so this still fails safely if another request somehow beat
          // us to this student_id in between.
          const authUserId = created.user.id;
          const { error: profileError } = await supabase.from("rizal_arcade_profiles").insert({ id: authUserId, ...profile, must_change_password: true });
          if (profileError) {
            if (profileError.code === "23505") {
              skipped.push({ studentId: student.studentId, reason: "Already imported by a concurrent request." });
            } else {
              await supabase.auth.admin.deleteUser(authUserId);
              throw new Error(`Could not save ${student.studentId}: ${profileError.message}`);
            }
          } else {
            credentials.push({ studentId: student.studentId, displayName: profile.display_name, sectionCode: section.section_code, temporaryPassword: password });
            createdCount += 1;
          }
          continue;
        }

        if (!createError) throw new Error(`Could not create ${student.studentId}: the account could not be created.`);
        const orphan = await findAuthUserByEmail(supabase, loginEmail);
        if (!orphan) throw new Error(`Could not create ${student.studentId}: ${createError.message}`);

        // Someone already holds this login email — either a genuine orphan (an auth user left over from a previous
        // failed import, with no profile) or a concurrent request creating this exact student right now. Claim the
        // profile row FIRST, before touching the password: rizal_arcade_profiles.student_id is unique, so only the
        // request whose insert actually commits can be sure its password is the one that ends up live on the
        // account. A losing request must never overwrite a password it will never get to show anyone.
        const { error: claimError } = await supabase.from("rizal_arcade_profiles").insert({ id: orphan.id, ...profile, must_change_password: true });
        if (claimError) {
          if (claimError.code === "23505") {
            skipped.push({ studentId: student.studentId, reason: "Already imported by a concurrent request." });
            continue;
          }
          throw new Error(`Could not save ${student.studentId}: ${claimError.message}`);
        }
        // We won the claim, so it is now safe to make `password` the account's real password.
        const { error: resetError } = await supabase.auth.admin.updateUserById(orphan.id, { password });
        if (resetError) throw new Error(`Profile saved for ${student.studentId} but the password could not be set: ${resetError.message}. Use "Reset password" to issue new credentials.`);
        credentials.push({ studentId: student.studentId, displayName: profile.display_name, sectionCode: section.section_code, temporaryPassword: password });
        createdCount += 1;
      } catch (studentError) {
        errors.push({ studentId: student.studentId, error: studentError instanceof Error ? studentError.message : "This student could not be imported." });
      }
    }

    const messageParts: string[] = [];
    if (errors.length) messageParts.push(`${errors.length} of ${students.length} students could not be imported. Fix and re-import just those rows — everyone else above was saved.`);
    if (skipped.length) messageParts.push(`${skipped.length} student${skipped.length === 1 ? "" : "s"} ${skipped.length === 1 ? "was" : "were"} already imported by an overlapping request — no new credentials were issued for them here; check that request's results or use "Reset password" if needed.`);
    if (!messageParts.length) {
      messageParts.push(credentials.length ? "Credentials were generated or safely refreshed. Download them now; passwords will not be shown again." : "All students already completed setup, so their profiles were updated without changing passwords.");
    }

    return json({
      section: section.section_code,
      total: students.length,
      created: createdCount,
      recovered,
      updated,
      credentials,
      errors,
      skipped,
      message: messageParts.join(" "),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export default { fetch: POST };

export const config = { maxDuration: 60 };
