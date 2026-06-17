# Task 3-b: Content Studio Voiceover TTS Wiring

**Agent:** full-stack-developer (Voiceover TTS wiring)
**Task:** Wire Content Studio Voiceover tab to real TTS API at /api/ai/voiceover

## File Modified
- `/home/z/my-project/src/components/pages/content-studio-page.tsx` (only file touched, per task constraints)

## What changed
Replaced the placeholder Voiceover TabsContent with a full voiceover studio containing 4 sections:
1. **Script input card** — Textarea with placeholder, char counter (X / 1024 chars, turns red over limit), "Use Script" button to pull from Script tab result.
2. **Playback settings card** — shadcn Slider (0.5–2.0 step 0.1) with current-speed Badge, 4 clickable speed marks (0.5x Slow / 1.0x Normal / 1.5x Fast / 2.0x Very Fast), selected-voice summary, "Generate Voiceover" CTA (bg-hermes-gradient) with loading state.
3. **Voice selector card** — Responsive grid of 7 voice cards (tongtong/chuichui/xiaochen/jam/kazi/douji/luodo), each with icon + name + description + preview play button. Selected card highlighted with border-hermes.
4. **Result card** — Conditional: error (warming-up message + Retry), success (audio player + Download MP3 + Generate Again + Clear), or empty state.

## Key implementation details
- API call: `fetch('/api/ai/voiceover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice, speed }) })`, check `!res.ok`, parse JSON error, `res.blob()` → `URL.createObjectURL(blob)`.
- Memory management: two split useEffect cleanups revoke `audioUrl` and `previewAudioUrl` on change/unmount. Manual revokes also inside generate/preview/clear handlers (idempotent).
- Voice preview: clicking a card's play button fetches a short "Hi there, I am {name}..." sample and auto-plays via a hidden `<audio ref>`. Subsequent clicks toggle play/pause. Small "Previewing: {name}" status bar with Clear button.
- Used `Icons` from lucide-react: Mic, AudioLines, Play, Pause, Loader2, Sparkles, Download, RefreshCw, Trash2, CloudOff, Check, Music2, FileText, Crown, Heart, Zap, Briefcase, Star, Leaf, Drama.
- Preserved existing styling: hermes-purple theme, no indigo/blue. 'use client' directive preserved, export name `ContentStudioPage` unchanged, Script tab untouched.

## Quality checks
- `bun run lint` on the file: **0 errors, 0 warnings** (only pre-existing parsing error in `src/hooks/use-live-notifications.ts` remains at project level — not mine).
- dev.log shows successful compiles ("✓ Compiled in 134ms", "✓ Compiled in 1064ms") after the change. Older "Parsing ecmascript source code failed" log entries are stale cached errors from a previous version — confirmed my current version uses the safe `array.join('\n')` pattern with no apostrophe-in-template-literal issues.

## Integration
- Page export `ContentStudioPage` matches the lazy import in `src/app/page.tsx` (unchanged).
- Consumes the existing `/api/ai/voiceover` POST route that returns binary MP3 audio.
