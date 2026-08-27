import { FormEvent, useEffect, useState } from "react";
import { getAccessToken, getSupabaseClient, type ArcadeProfile } from "./auth";
import { loadLeaderboard, type LeaderboardEntry, type LeaderboardGame } from "./leaderboard";
import { parseRosterFile, studentDisplayName, type ParsedRoster } from "./roster";

type Credential = { studentId: string; displayName: string; sectionCode: string; temporaryPassword: string };
type AdminSection = { id: string; section_code: string; school_year: string; term: string };
type Tab = "roster" | "leaderboards" | "passwords";

const games: Array<{ id: LeaderboardGame; label: string }> = [
  { id: "values", label: "River Quest" },
  { id: "novels", label: "Noli Case Files" },
  { id: "codebreaker", label: "Codebreaker" },
  { id: "scholar", label: "Scholar’s Journey" },
];

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadCredentials(credentials: Credential[], sectionCode: string) {
  const rows = [["Student ID", "Display Name", "Section", "Temporary Password"], ...credentials.map((item) => [item.studentId, item.displayName, item.sectionCode, item.temporaryPassword])];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `rizal-arcade-credentials-${sectionCode.replace(/[^a-z0-9-]+/gi, "-")}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function adminRequest(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { Authorization: `Bearer ${await getAccessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  let result: Record<string, unknown>;
  try {
    result = JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    throw new Error(`The server returned an unreadable response (${response.status}). Please try again after the latest deployment finishes.`);
  }
  if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "The admin request failed.");
  return result;
}

function AdminLeaderboard({ sections }: { sections: AdminSection[] }) {
  const [sectionId, setSectionId] = useState("");
  const [game, setGame] = useState<LeaderboardGame>("values");
  const [result, setResult] = useState<{ key: string; entries: LeaderboardEntry[] }>({ key: "", entries: [] });
  const requestKey = sectionId ? `${sectionId}:${game}` : "";
  const entries = result.key === requestKey ? result.entries : [];
  const loading = Boolean(requestKey && result.key !== requestKey);

  useEffect(() => {
    if (!sectionId) return;
    let active = true;
    const key = `${sectionId}:${game}`;
    loadLeaderboard(game, sectionId).then((board) => { if (active) setResult({ key, entries: board.entries }); });
    return () => { active = false; };
  }, [game, sectionId]);

  return (
    <section className="admin-block">
      <div className="admin-block-heading"><div><p className="eyebrow">Section-only rankings</p><h2>Leaderboards</h2></div></div>
      <div className="admin-filters">
        <label>Section<select value={sectionId} onChange={(event) => setSectionId(event.target.value)}><option value="">Choose a section</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.section_code} · {section.school_year} {section.term}</option>)}</select></label>
        <label>Game<select value={game} onChange={(event) => setGame(event.target.value as LeaderboardGame)}>{games.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      </div>
      <ol className="admin-leaderboard">
        {!sectionId ? <li className="admin-empty">Choose a section to view its board.</li> : loading ? <li className="admin-empty">Loading scores…</li> : entries.length === 0 ? <li className="admin-empty">No scores have been recorded for this game.</li> : entries.map((entry, index) => <li key={`${entry.player_name}-${entry.achieved_at}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{entry.player_name}</strong><b>{entry.score}</b></li>)}
      </ol>
    </section>
  );
}

export default function AdminPortal({ profile, onClose, onSignOut }: { profile: ArcadeProfile; onClose: () => void; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>("roster");
  const [roster, setRoster] = useState<ParsedRoster | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetStudentId, setResetStudentId] = useState("");
  const [resetCredential, setResetCredential] = useState<Credential | null>(null);
  const [sections, setSections] = useState<AdminSection[]>([]);

  useEffect(() => {
    let active = true;
    getSupabaseClient().from("rizal_arcade_sections").select("id,section_code,school_year,term").order("school_year", { ascending: false }).order("section_code").then(({ data }) => {
      if (active) setSections((data ?? []) as AdminSection[]);
    });
    return () => { active = false; };
  }, [credentials.length]);

  async function chooseFile(file?: File) {
    if (!file) return;
    setBusy(true); setMessage(""); setCredentials([]);
    try { setRoster(await parseRosterFile(file)); }
    catch (error) { setRoster(null); setMessage(error instanceof Error ? error.message : "The spreadsheet could not be read."); }
    finally { setBusy(false); }
  }

  async function importRoster() {
    if (!roster) return;
    setBusy(true); setMessage("");
    try {
      const { fileName: _fileName, ...payload } = roster;
      void _fileName;
      const result = await adminRequest("/api/admin/import-roster", payload);
      const nextCredentials = Array.isArray(result.credentials) ? result.credentials as Credential[] : [];
      setCredentials(nextCredentials);
      setMessage(typeof result.message === "string" ? result.message : "Roster imported.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The roster could not be imported.");
    } finally { setBusy(false); }
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage(""); setResetCredential(null);
    try {
      const result = await adminRequest("/api/admin/reset-student-password", { studentId: resetStudentId });
      setResetCredential(result.credential as Credential);
      setMessage(typeof result.message === "string" ? result.message : "Password reset.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "The password could not be reset."); }
    finally { setBusy(false); }
  }

  return (
    <main className="admin-page">
      <header className="admin-header"><a className="brand" href="#top" onClick={(event) => { event.preventDefault(); onClose(); }}><span className="brand-mark">RA</span><span>Rizal Arcade</span><small>Admin</small></a><div><span>{profile.display_name}</span><button type="button" onClick={onClose}>View arcade</button><button type="button" onClick={onSignOut}>Sign out</button></div></header>
      <div className="admin-shell">
        <aside><p className="eyebrow">Classroom control</p><h1>Admin desk</h1><nav aria-label="Admin sections"><button className={tab === "roster" ? "active" : ""} type="button" onClick={() => setTab("roster")}>Roster import</button><button className={tab === "leaderboards" ? "active" : ""} type="button" onClick={() => setTab("leaderboards")}>Leaderboards</button><button className={tab === "passwords" ? "active" : ""} type="button" onClick={() => setTab("passwords")}>Password reset</button></nav><div className="admin-scope"><strong>Current scope</strong><span>One administrator</span><span>{sections.length} imported section{sections.length === 1 ? "" : "s"}</span></div></aside>
        <div className="admin-workspace">
          {tab === "roster" && <section className="admin-block">
            <div className="admin-block-heading"><div><p className="eyebrow">Enrollment spreadsheet</p><h2>Import a section.</h2><p>One Excel file equals one leaderboard section. Course-code differences inside the roster do not split it.</p></div><label className="upload-button">Choose .xlsx<input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => chooseFile(event.target.files?.[0])} /></label></div>
            {roster ? <div className="roster-preview"><div className="roster-summary"><span><small>Section</small><strong>{roster.sectionCode}</strong></span><span><small>School year</small><strong>{roster.schoolYear}</strong></span><span><small>Term</small><strong>{roster.term}</strong></span><span><small>Students</small><strong>{roster.students.length}</strong></span></div><div className="roster-table-wrap"><table><thead><tr><th>Student ID</th><th>Leaderboard name</th><th>Course</th><th>Roster email</th></tr></thead><tbody>{roster.students.slice(0, 8).map((student) => <tr key={student.studentId}><td>{student.studentId}</td><td>{studentDisplayName(student)}</td><td>{student.courseCode}</td><td>{student.email}</td></tr>)}</tbody></table>{roster.students.length > 8 && <p>Plus {roster.students.length - 8} more students in this file.</p>}</div><button className="button button-primary" type="button" onClick={importRoster} disabled={busy}>{busy ? "Importing accounts…" : `Create or update ${roster.students.length} accounts`}</button></div> : <div className="admin-empty-state"><span>XL</span><h3>Upload the official enrollment file</h3><p>The section, term, instructor, Student IDs, names, course codes, and emails will be read automatically.</p></div>}
            {credentials.length > 0 && <div className="credential-result"><div><p className="eyebrow">Shown only after creation</p><h3>{credentials.length} new credentials</h3><p>Download these now and distribute each row privately.</p></div><button type="button" className="button button-dark" onClick={() => downloadCredentials(credentials, roster?.sectionCode ?? "section")}>Download credential CSV</button><div className="credential-table"><table><thead><tr><th>Student ID</th><th>Name</th><th>Temporary password</th></tr></thead><tbody>{credentials.map((item) => <tr key={item.studentId}><td>{item.studentId}</td><td>{item.displayName}</td><td><code>{item.temporaryPassword}</code></td></tr>)}</tbody></table></div></div>}
          </section>}
          {tab === "leaderboards" && <AdminLeaderboard sections={sections} />}
          {tab === "passwords" && <section className="admin-block"><div className="admin-block-heading"><div><p className="eyebrow">Account recovery</p><h2>Reset one student.</h2><p>This invalidates the old password and requires another password change after sign-in.</p></div></div><form className="reset-form" onSubmit={resetPassword}><label>Student ID<input value={resetStudentId} onChange={(event) => setResetStudentId(event.target.value)} /></label><button className="button button-primary" type="submit" disabled={busy}>{busy ? "Resetting…" : "Generate temporary password"}</button></form>{resetCredential && <div className="reset-result"><span>{resetCredential.displayName}</span><strong>{resetCredential.studentId}</strong><code>{resetCredential.temporaryPassword}</code></div>}</section>}
          {message && <p className="admin-message" role="status">{message}</p>}
        </div>
      </div>
    </main>
  );
}
