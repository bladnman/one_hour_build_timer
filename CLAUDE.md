# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Development - runs Vite dev server with Tauri
npm run tauri dev

# Build production app
npm run tauri build

# Frontend only (no Tauri)
npm run dev          # Vite dev server
npm run build        # TypeScript check + Vite build

# Type checking
npx tsc --noEmit
```

## Architecture Overview

This is a **Tauri v2 desktop countdown timer** with a React + TypeScript frontend.

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Tauri v2 with Rust
- **Styling**: CSS custom properties with viewport-based scaling (vmin + rem)

### Key Architectural Decisions

1. **Aspect Ratio Enforcement**: Handled in Rust (`src-tauri/src/lib.rs`) via window resize events, not JavaScript. Uses 2.5:1 ratio.

2. **Window Features**: Borderless, transparent (macOS private API), always-on-top, position persistence via `tauri-plugin-window-state`.

3. **UI Scaling**: Dynamic root font-size based on viewport (`clamp(10px, 4vmin, 40px)`) with all sizing in rem units.

4. **State Management**: React hooks only (useTimer, useLocalStorage, useUserPresets) - no external state libraries.

### Directory Structure

```
src/
├── config/       # Constants: colors, timing, presets, window dimensions
├── hooks/        # useTimer (core logic), useScaling, useKeyboardShortcuts, etc.
├── components/
│   ├── Timer/    # TimerDisplay, TimeSegment (click-to-edit), ColonSeparator
│   ├── Controls/ # PlayPauseButton, ResetButton, PresetButtons
│   └── Title/    # EditableTitle
├── styles/       # CSS: theme.css (variables), global.css, animations.css
├── types/        # TypeScript interfaces for timer state
└── utils/        # Time formatting/parsing

src-tauri/
├── src/lib.rs    # Aspect ratio enforcement, plugin registration
└── tauri.conf.json
```

### Timer States
- `idle` - Initial state, gray color
- `running` - Counting down, green color
- `paused` - Stopped mid-countdown, gray color
- `overtime` - Past zero, counting up negative, red color
