TERAX.md

# Session: Strip AI from Terax (2026-05-19)

## Goal
Remove all AI functions from the Terax codebase, converting from an AI-native terminal (ADE) to a standalone terminal emulator + editor.

## Status: DONE
Both `tsc --noEmit` and `cargo check` pass with zero errors. `npm run build` succeeds (792 modules, 7.42s). `npm run tauri dev` launches and runs.

## Deleted modules
- `src/modules/ai/` (~50 files: agents, composer, chat store, sessions, tools, config, providers, keyring, voice, sub-agents, todos, plans, snippets)
- `src/components/ai-elements/` (10 files: tool, message, conversation, chat-code, reasoning, etc.)
- `src/modules/editor/lib/autocomplete/` (AI inline completion provider + extension)
- Rust AI backend: `shell_run_command`, `shell_session_*`, `shell_bg_*`, `secrets.rs`, `net.rs`
- AI setting sections (`ModelsSection.tsx`, `AgentsSection.tsx`, `ProviderIcon.tsx`, `ProviderKeyCard.tsx`)
- AI status bar (`AiTools.tsx`)

## Key changes
- Created `src/lib/git.ts` — clean git invoke proxy (replaces `@/modules/ai/lib/native`)
- Removed `onAttachToAgent` prop from FileExplorer, TreeRow, ExplorerSearch
- Stripped AI commit message generation from source control (hook + UI)
- Removed AI autocomplete imports, keyring, and related effects from EditorPane
- Removed all AI commands from Rust `lib.rs` and `mod.rs`
- Removed AI SDK deps from `package.json` (7 `@ai-sdk/*` + `ai` + `streamdown` + `tokenlens`)
- `tauri.conf.json`: changed `beforeDevCommand`/`beforeBuildCommand` from `pnpm` to `npm run`

## Key decisions
- Kept PTY, file explorer, editor, preview, git, and window management modules untouched
- Git operations moved to `@/lib/git` instead of living under `@/modules/ai/lib/native`
- Stripped AI commit message generation entirely (button + shortcut + prompt builders + API calls)
- All `native.*` calls replaced with direct `invoke()` calls (App.tsx) or `@/lib/git` proxy

## Notes
- Rust toolchain must use MSVC (`stable-x86_64-pc-windows-msvc`) — the GNU/mingw linker fails with "export ordinal too large: 133148" on this project
- Pre-existing version mismatch: `@tauri-apps/api v2.11.0` vs Rust `tauri v2.10.3`
