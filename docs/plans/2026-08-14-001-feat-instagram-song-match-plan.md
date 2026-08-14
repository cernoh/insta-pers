---
title: "feat: Match Instagram posts to a song"
type: feat
status: active
created: 2026-08-14
---

# Problem Frame

Create a cute, friendly web app that takes a user's latest three Instagram posts and recommends one song. The recommendation is driven by the posts' visual colors, the resulting palette and mood, and profile context from the handle, bio, and captions. The first release is a polished demonstrable prototype with deterministic demo data; live Instagram access is isolated behind a replaceable adapter because Instagram API credentials and permissions are deployment concerns.

## Scope

- Fetch or load exactly the latest three image posts through a provider adapter.
- Extract a dominant color from each image and combine the three colors into a palette.
- Map palette characteristics to a readable mood, then select a song from a curated catalog using mood plus profile signals.
- Analyze handle, bio, and captions as lightweight transparent keyword signals; no opaque external AI dependency is required for the prototype.
- Present the three posts, swatches, mood, song recommendation, reasoning, and a retry/demo profile flow in a warm, playful interface.
- Keep credentials, live OAuth, persistent accounts, and production-scale recommendation learning out of this initial slice.

## Success Criteria

- A visitor can submit the demo profile and see three posts, three extracted dominant colors, a named palette mood, and one song recommendation end to end.
- The result visibly explains how colors and profile context influenced the pick.
- The pipeline remains deterministic for the same input and has tests for empty/low-signal profile text, image-color edge cases, and song fallback behavior.
- Layout is responsive, keyboard-accessible, and visually verified in a browser.

## Key Technical Decisions

- Use a small client-side TypeScript React app with local fixture data and pure recommendation functions; this keeps the prototype deployable without secrets or a backend.
- Model Instagram access as an interface/adapter so a future server-side OAuth provider can replace fixtures without changing the UI or matching pipeline.
- Use a simple dominant-color extraction algorithm over sampled image pixels, then derive hue family, saturation, and brightness. Prefer explainability over a heavyweight vision dependency.
- Use curated mood rules and a small song catalog. Profile terms adjust mood scores rather than overriding image evidence; ties resolve deterministically.
- Use CSS for the aesthetic and motion; avoid adding an animation dependency for a single page.

## Output Structure

```text
index.html
package.json
src/
  App.tsx
  main.tsx
  styles.css
  data/demoProfile.ts
  lib/colorMatch.ts
  lib/instagram.ts
  types.ts
  test/colorMatch.test.ts
  test/instagram.test.ts
```

## Implementation Units

### U1. App foundation and Instagram provider contract

**Goal:** Create a runnable React TypeScript app with a provider contract and demo profile data representing exactly three posts.

**Requirements:** Latest-three post input, replaceable provider boundary, deterministic demo path.

**Dependencies:** None.

**Files:** `package.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/types.ts`, `src/lib/instagram.ts`, `src/data/demoProfile.ts`, `src/test/instagram.test.ts`.

**Approach:** Define profile/post/song/match types and a provider function that returns the latest three posts. The fixture provider returns stable remote image URLs, profile handle, bio, and captions. Validate/normalize the provider result to three posts and expose a clear error for fewer than three usable image posts. Keep live OAuth explicitly unimplemented behind the adapter boundary.

**Patterns to follow:** Small pure modules, typed data at boundaries, semantic React components.

**Test scenarios:**
- Happy path: fixture provider returns three posts ordered newest first with captions and image URLs.
- Edge case: provider data with more than three posts is truncated to the three newest.
- Error path: fewer than three usable image posts produces a user-facing error state rather than a partial recommendation.

**Verification:** App starts, loads the demo profile, and exposes typed post data to the matching pipeline.

### U2. Explainable color and profile matching pipeline

**Goal:** Implement the end-to-end dominant-color → palette → mood → song pipeline, including profile analysis.

**Requirements:** Dominant-color extraction for all three images; palette-to-mood-to-song mapping; bio/caption/handle signals feeding the final pick; explainable result.

**Dependencies:** U1.

**Files:** `src/lib/colorMatch.ts`, `src/types.ts`, `src/test/colorMatch.test.ts`.

**Approach:** Sample pixels from each post image with a small deterministic extractor and classify colors into hue families plus brightness/saturation. Aggregate three dominant colors into a palette summary. Score moods from palette traits, then add bounded keyword weights from handle, bio, and captions. Select the highest-scoring song from a curated catalog with deterministic tie-breaking. Return intermediate evidence: swatches, palette label, mood, profile signals, and reason strings so the UI can show the path instead of only a title. Handle image load failure by using a neutral fallback color and recording the fallback in evidence; the demo path may use precomputed fixture colors when browser image decoding is unavailable in unit tests.

**Patterns to follow:** Pure functions with injected pixel/color inputs for tests; no network calls inside matching logic.

**Test scenarios:**
- Happy path: warm pink/orange/cream pixels produce a warm, upbeat mood and matching song.
- Happy path: cool blue/green/purple pixels produce a dreamy or reflective mood and matching song.
- Integration: three post colors plus bio/caption keywords alter the winning song and include both visual and profile reasons.
- Edge case: grayscale or low-saturation colors produce a neutral/cozy fallback mood.
- Edge case: empty handle, bio, and captions do not throw and do not add profile score.
- Error path: unavailable image pixels use the neutral fallback and still return a complete recommendation.
- Determinism: repeated identical input returns the same song, score ordering, and reason set.

**Verification:** A single pure call accepts three posts plus profile text and returns all evidence needed to render the recommendation.

### U3. Friendly recommendation workspace

**Goal:** Build the responsive, cute interface for profile entry, post preview, palette display, mood explanation, and song result.

**Requirements:** Friendly aesthetic, end-to-end user flow, transparent recommendation explanation, accessibility.

**Dependencies:** U1, U2.

**Files:** `src/App.tsx`, `src/styles.css`, `src/main.tsx`.

**Approach:** Use a warm paper-like background, coral/peach accent, rounded editorial typography, hand-drawn-inspired decorative details, and restrained CSS entrance/hover motion. Compose one clear workspace: heading and handle entry, three post thumbnails, a palette strip, mood badge, song card, and “why this song” evidence list. Include loading, invalid profile, failed image, and empty result states. Preserve semantic landmarks, visible focus rings, sufficient contrast, and mobile stacking.

**Patterns to follow:** CSS variables, semantic buttons/forms, reduced-motion media query.

**Test scenarios:**
- Happy path: submitting the demo handle renders exactly three post previews, three swatches, mood, song, and reason text.
- Error path: invalid/blank handle shows validation without destroying the previous valid result.
- Integration: image failure state remains readable and still displays the neutral recommendation evidence.
- Accessibility: form controls have labels, buttons are keyboard reachable, and reduced-motion disables entrance animation.

**Verification:** Browser smoke test confirms the primary flow and responsive layout at desktop and narrow viewport widths.

## System-Wide Impact

- End users see a recommendation with transparent visual/profile evidence, not just a song title.
- Future backend work can implement the provider adapter without changing matching or presentation contracts.
- No secrets or user data are persisted in the prototype; live Instagram OAuth is deferred.

## Risks and Mitigations

- Instagram access restrictions: isolate provider contract and ship fixture mode first.
- Browser image CORS/decoding failures: support precomputed fixture colors and neutral fallback evidence.
- Color-to-mood subjectivity: keep rules and catalog small, visible, and deterministic so they can be tuned.
- Accessibility risk from cute styling: use semantic HTML, contrast checks, focus states, and reduced-motion support.

## Deferred to Follow-Up Work

- Production Instagram OAuth, token storage, rate limiting, and server-side image proxying.
- Larger music catalog or Spotify/Apple Music links.
- User accounts, saved history, collaborative tuning, and model-based semantic caption analysis.
- Deployment configuration and analytics.

## Verification Plan

Run unit tests for the pure pipeline and provider contract, then start the app and perform a browser smoke test covering demo submit, error state, and responsive layout. Review the final diff for leaked secrets and verify no live API credentials are required.
