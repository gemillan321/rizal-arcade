import { FormEvent, useEffect, useRef, useState } from "react";
import { authConfigured, changeFirstPassword, signInToArcade, type ArcadeAuthSnapshot, type ArcadeProfile } from "./auth";

export function LoginPortal({ onAuthenticated, onClose }: { onAuthenticated: (snapshot: ArcadeAuthSnapshot) => void; onClose: () => void }) {
  const cardRef = useRef<HTMLElement>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cardRef.current?.querySelector<HTMLElement>("input")?.focus();
    function escape(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    window.addEventListener("keydown", escape);
    return () => { window.removeEventListener("keydown", escape); document.body.style.overflow = previousOverflow; };
  }, [onClose]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!identifier.trim() || !password) { setMessage("Enter your Student ID/email and password."); return; }
    setBusy(true);
    setMessage("");
    try {
      onAuthenticated(await signInToArcade(identifier, password));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <button type="button" className="auth-backdrop" aria-label="Close sign in" onClick={onClose} />
      <section className="auth-card" ref={cardRef}>
        <button type="button" className="icon-button" aria-label="Close sign in" onClick={onClose}>×</button>
        <div className="auth-badge">RA</div>
        <p className="eyebrow">Student entrance</p>
        <h2 id="login-title">Enter the arcade.</h2>
        <p>Students use the credentials issued from their official class roster. The administrator signs in with an email address.</p>
        <form onSubmit={submit} className="auth-form">
          <label>Student ID or admin email<input value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
          <button className="button button-primary" type="submit" disabled={busy || !authConfigured}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        {!authConfigured && <p className="auth-alert">Classroom login is ready in the code but still needs the Supabase environment keys.</p>}
        {message && <p className="auth-message" role="alert">{message}</p>}
        <small>Scores and leaderboards are visible only inside your assigned section.</small>
      </section>
    </div>
  );
}

export function FirstPasswordPortal({ profile, onComplete, onSignOut }: { profile: ArcadeProfile; onComplete: (profile: ArcadeProfile) => void; onSignOut: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 10) { setMessage("Use at least 10 characters."); return; }
    if (password !== confirm) { setMessage("The two passwords do not match."); return; }
    setBusy(true);
    setMessage("");
    try {
      onComplete(await changeFirstPassword(password));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The password could not be changed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="password-page">
      <section className="password-card">
        <div className="auth-badge">RA</div>
        <p className="eyebrow">First sign-in · {profile.display_name}</p>
        <h1>Create your own password.</h1>
        <p>Your temporary password worked. Replace it before entering the games or section leaderboard.</p>
        <form onSubmit={submit} className="auth-form">
          <label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={10} /></label>
          <label>Confirm new password<input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" minLength={10} /></label>
          <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save password and enter"}</button>
        </form>
        {message && <p className="auth-message" role="alert">{message}</p>}
        <button className="text-button" type="button" onClick={onSignOut}>Sign out instead</button>
      </section>
    </main>
  );
}
