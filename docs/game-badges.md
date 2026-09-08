# Game completion badges

Students earn one badge per game when a completed round successfully saves through `submit_rizal_arcade_score`. Any valid final score, including zero, qualifies. Opening a game or leaving before the results screen does not qualify. Guests and administrators do not earn badges.

The Supabase score trigger creates each award in the same transaction as the score. The `(student_id, game_id)` primary key makes retries and repeat plays idempotent. Award dates remain unchanged by higher scores, lower scores, or section transfers. The collection derives the laureate medal from all ten distinct game awards.

## Database setup

1. Existing installations: apply `supabase/repair_score_recording.sql` if the ten-game score repair is not already installed. Do not rerun the destructive fresh-install schema on an existing database.
2. Apply `supabase/add_game_badges.sql` once to the Supabase project used by the testing environment. It is additive and safe to rerun. It creates badge storage, student-only read security, a score trigger, and a backfill from existing saved scores.
3. Run `supabase/verify_game_badges.sql` as postgres. The verification requires one eligible student and rolls back all test score/award writes.

The production database integration was tested in a rollback-only transaction on September 8, 2026. All assertions passed. The persistent production migration remains pending explicit user approval; the preview alone does not create the table. Until the migration is applied, score saves continue to work and badge loading shows an error with a retry button.

Historical first-completion dates were not stored. Backfilled awards use the earliest retained personal-best timestamp, which can be later than the original completion. New awards record their first save date. Device-local scores are deliberately not imported because they are not tied to an account.

## Testing the branch

Sign in with a student account and open **Badges**. Complete a round and wait for the score save and badge confirmation. Return to the arcade, reload, and verify that the award remains. Replaying must leave the award date and collection count unchanged. After all ten distinct games, the Keeper of Rizal’s Legacy medal unlocks. Sign out or switch accounts to verify that the previous collection is no longer displayed.

The supplied artwork's Roman numerals are preserved: Dapitan uses medal X, El Fili uses VIII, and Crossword uses IX. Mapping uses game IDs rather than medal position. Assets are standalone local SVGs extracted from the user-provided Claude Design export; the design runtime is not included.

This feature shares the existing score system's trust model: game completion is reported by the client at the results screen; server-side score validation and account authorization are enforced, but gameplay is not independently attested by the server.
