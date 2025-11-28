# Countdown Timer - Tauri v2 Implementation Plan

## Overview

A well-architected Tauri v2 desktop countdown timer with:
- Borderless, always-on-top, resizable window with fixed aspect ratio
- **Semi-transparent dark background** (~85% opacity) - widget-like feel
- Scalable UI that grows/shrinks proportionally with window
- Click-to-edit time segments with keyboard navigation
- Color-coded states (running/paused/overtime)
- Position and size persistence across launches
- **React + TypeScript + Vite** frontend

### User Decisions
- **Transparency**: Enabled (using macOS private API, no App Store)
- **Background**: Semi-transparent dark
- **Framework**: React
- **Default Title**: App name ("Countdown Timer")

---

## 1. Project Setup

### Commands (in current directory)
```bash
# Create Tauri app with React + TypeScript + Vite
npm create tauri-app@latest . -- --template react-ts

# Install additional dependencies
npm install @tauri-apps/plugin-window-state

# Rust plugin (added to Cargo.toml)
# tauri-plugin-window-state = "2"
```

---

## 2. File Structure

```
one_hour_build_timer/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── config/
│   │   ├── index.ts              # Re-exports all config
│   │   ├── colors.ts             # Timer state colors
│   │   ├── timing.ts             # Tick interval, max time
│   │   ├── presets.ts            # Default time presets
│   │   ├── window.ts             # Aspect ratio, dimensions
│   │   └── storage-keys.ts       # localStorage keys
│   │
│   ├── types/
│   │   ├── index.ts
│   │   └── timer.ts              # TimerState, TimerStatus, TimeSegments
│   │
│   ├── hooks/
│   │   ├── useTimer.ts           # Core timer logic
│   │   ├── useTimerDisplay.ts    # Format switching (HH:MM vs MM:SS)
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useLocalStorage.ts
│   │   └── useUserPresets.ts     # Recent user times
│   │
│   ├── components/
│   │   ├── Timer/
│   │   │   ├── TimerContainer.tsx
│   │   │   ├── TimerDisplay.tsx
│   │   │   ├── TimeSegment.tsx   # Click-to-edit segment
│   │   │   └── ColonSeparator.tsx
│   │   ├── Controls/
│   │   │   ├── PlayPauseButton.tsx
│   │   │   └── PresetButtons.tsx
│   │   └── Title/
│   │       └── EditableTitle.tsx
│   │
│   ├── styles/
│   │   ├── theme.css             # CSS custom properties
│   │   ├── global.css            # Reset, base styles
│   │   └── animations.css        # Keyframes
│   │
│   └── utils/
│       ├── time.ts               # Format/parse time
│       └── time.test.ts
│
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   └── src/
│       └── lib.rs                # Aspect ratio enforcement
```

---

## 3. Configuration Files

### config/colors.ts
```typescript
export const TIMER_COLORS = {
  running: '#22c55e',    // Green
  paused: '#6b7280',     // Gray
  overtime: '#ef4444',   // Red
  colon: '#9ca3af',      // Gray (separator)
} as const;
```

### config/window.ts
```typescript
export const WINDOW_CONFIG = {
  ASPECT_RATIO: 8 / 3,   // Wide format for HH:MM:SS
  DEFAULT_WIDTH: 400,
  DEFAULT_HEIGHT: 150,
  MIN_WIDTH: 250,
  MIN_HEIGHT: 94,
} as const;
```

### config/presets.ts
```typescript
export const DEFAULT_PRESETS = [
  { label: '1m', seconds: 60 },
  { label: '15m', seconds: 900 },
  { label: '30m', seconds: 1800 },
  { label: '1h', seconds: 3600 },
];

export const MAX_USER_PRESETS = 2;
```

### config/app.ts
```typescript
export const APP_CONFIG = {
  name: 'Countdown Timer',      // Default title shown above timer
  version: '0.1.0',
} as const;
```

---

## 4. Tauri Configuration

### src-tauri/tauri.conf.json
```json
{
  "app": {
    "macOSPrivateApi": true,
    "windows": [{
      "label": "main",
      "title": "Countdown Timer",
      "width": 400,
      "height": 150,
      "minWidth": 250,
      "minHeight": 94,
      "visible": false,
      "decorations": false,
      "transparent": true,
      "alwaysOnTop": true,
      "resizable": true
    }]
  }
}
```

### src-tauri/src/lib.rs (Aspect Ratio Enforcement)
```rust
use tauri::{Manager, WindowEvent, PhysicalSize};

const ASPECT_RATIO: f64 = 8.0 / 3.0;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            let window_clone = window.clone();

            window.on_window_event(move |event| {
                if let WindowEvent::Resized(size) = event {
                    enforce_aspect_ratio(&window_clone, size);
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error running app");
}

fn enforce_aspect_ratio(window: &tauri::WebviewWindow, size: &PhysicalSize<u32>) {
    let ratio = size.width as f64 / size.height as f64;
    if (ratio - ASPECT_RATIO).abs() < 0.01 { return; }

    let (w, h) = if ratio > ASPECT_RATIO {
        ((size.height as f64 * ASPECT_RATIO) as u32, size.height)
    } else {
        (size.width, (size.width as f64 / ASPECT_RATIO) as u32)
    };

    let _ = window.set_size(tauri::Size::Physical(PhysicalSize { width: w, height: h }));
}
```

---

## 5. UI Scaling Strategy

**Approach:** Dynamic root font-size based on viewport + REM units throughout

### styles/global.css
```css
:root {
  /* Scale everything based on viewport minimum dimension */
  font-size: clamp(10px, 4vmin, 40px);
}

html, body {
  background: transparent;
  margin: 0;
  height: 100%;
}

.app-container {
  /* Semi-transparent dark background */
  background: rgba(30, 30, 30, 0.85);
  border-radius: 12px;
  height: 100%;
}
```

### Component Sizing (all in rem)
```css
.timer-display {
  font-size: 6rem;        /* Scales with root */
  font-family: 'SF Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.control-button {
  font-size: 1.5rem;
  padding: 0.3rem;
}

.title {
  font-size: 0.9rem;
}
```

---

## 6. Core Components

### TimeSegment (Click-to-Edit)
- Displays 2-digit value with leading zero
- Click enters edit mode (pauses timer)
- Arrow keys: Up/Down to increment/decrement
- Values wrap (59+1=0 with carry to next segment)
- Tab moves to next segment
- Escape/Enter exits edit mode

### ColonSeparator
- CSS animation for throbbing effect
- Pauses animation when timer paused
- Respects `prefers-reduced-motion`

### TimerDisplay
- Determines format: ≥1hr shows HH:MM, <1hr shows MM:SS
- Applies color state via data attribute
- Shows minus sign when negative

---

## 7. State Management

### useTimer Hook
```typescript
interface TimerState {
  remainingSeconds: number;
  status: 'idle' | 'running' | 'paused' | 'overtime';
  initialSeconds: number;
  editingSegment: 'hours' | 'minutes' | 'seconds' | null;
}

interface UseTimerReturn {
  state: TimerState;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  setTime: (seconds: number) => void;
  setSegment: (segment: string, value: number) => void;
  startEditing: (segment: string) => void;
  stopEditing: () => void;
}
```

---

## 8. Window Features

### Drag Region
- Use `data-tauri-drag-region` on main container
- Child interactive elements need `pointer-events: auto`

### Custom Resize Handle
- Bottom-right corner visual indicator
- JavaScript handler calls `window.setSize()` with aspect ratio lock

### Position Persistence
- `tauri-plugin-window-state` handles automatically
- Window starts hidden, shown after position restored

---

## 9. Implementation Order

1. **Project scaffolding** - Tauri + React + TypeScript setup
2. **Config files** - All constants defined first
3. **Types** - TypeScript interfaces
4. **Utils** - Time formatting/parsing with tests
5. **Tauri config** - Window settings, Rust aspect ratio code
6. **Styles** - CSS variables, global styles, animations
7. **Hooks** - useTimer, useLocalStorage, useKeyboardShortcuts
8. **Components** (bottom-up):
   - TimeSegment
   - ColonSeparator
   - TimerDisplay
   - PlayPauseButton
   - PresetButtons
   - EditableTitle
   - TimerContainer
9. **App.tsx** - Wire everything together
10. **Testing** - Component and integration tests

---

## 10. Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering | Pure DOM/CSS | Better text rendering, accessibility |
| Scaling | vmin + rem | Simple, performant, single control point |
| State | React hooks | Sufficient for simple app, no Redux needed |
| Aspect ratio | Rust event handler | More reliable than JS-only approach |
| Styling | CSS custom properties | Easy theming, externalized config |
| Testing | Vitest + RTL | Fast, Vite-native |
