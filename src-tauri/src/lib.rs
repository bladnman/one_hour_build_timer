use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicU32, Ordering};
use tauri::{
    AppHandle, Emitter, Manager, PhysicalPosition, PhysicalSize, WebviewUrl, WebviewWindowBuilder,
    WindowEvent,
};

/// Aspect ratio for the timer window (width / height)
/// 2.5:1 ratio provides a compact format for HH:MM:SS display
const ASPECT_RATIO: f64 = 2.5;

/// Default window dimensions
const DEFAULT_WIDTH: u32 = 312;
const DEFAULT_HEIGHT: u32 = 125;
const MIN_WIDTH: u32 = 250;
const MIN_HEIGHT: u32 = 100;

/// Counter for generating unique window IDs
static WINDOW_COUNTER: AtomicU32 = AtomicU32::new(1);

/// Window state for persistence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowState {
    pub id: String,
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub width: u32,
    pub height: u32,
}

/// Create a new timer window
#[tauri::command]
async fn create_window(app: AppHandle, x: Option<i32>, y: Option<i32>) -> Result<String, String> {
    let window_id = format!("timer-{}", WINDOW_COUNTER.fetch_add(1, Ordering::SeqCst));

    let url = WebviewUrl::App(format!("index.html?windowId={}", window_id).into());

    let mut builder = WebviewWindowBuilder::new(&app, &window_id, url)
        .title("Countdown Timer")
        .inner_size(DEFAULT_WIDTH as f64, DEFAULT_HEIGHT as f64)
        .min_inner_size(MIN_WIDTH as f64, MIN_HEIGHT as f64)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .resizable(true)
        .shadow(false)
        .visible(true);

    // Set position if provided (offset from parent window)
    if let (Some(px), Some(py)) = (x, y) {
        builder = builder.position(px as f64 + 30.0, py as f64 + 30.0);
    }

    let window = builder.build().map_err(|e| e.to_string())?;

    // Set up aspect ratio enforcement for the new window
    let window_clone = window.clone();
    window.on_window_event(move |event| {
        if let WindowEvent::Resized(size) = event {
            enforce_aspect_ratio(&window_clone, size);
        }
    });

    Ok(window_id)
}

/// Close a window by ID
#[tauri::command]
async fn close_window(app: AppHandle, window_id: String) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_id) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Get current window position and size
#[tauri::command]
async fn get_window_state(app: AppHandle, window_id: String) -> Result<WindowState, String> {
    let window = app
        .get_webview_window(&window_id)
        .ok_or_else(|| format!("Window {} not found", window_id))?;

    let position = window.outer_position().map_err(|e| e.to_string())?;
    let size = window.inner_size().map_err(|e| e.to_string())?;

    Ok(WindowState {
        id: window_id,
        x: Some(position.x),
        y: Some(position.y),
        width: size.width,
        height: size.height,
    })
}

/// Restore windows from saved state on app startup
#[tauri::command]
async fn restore_windows(app: AppHandle, windows: Vec<WindowState>) -> Result<(), String> {
    for state in windows {
        // Skip the main window, it's already created
        if state.id == "main" {
            continue;
        }

        let url = WebviewUrl::App(format!("index.html?windowId={}", state.id).into());

        let mut builder = WebviewWindowBuilder::new(&app, &state.id, url)
            .title("Countdown Timer")
            .inner_size(state.width as f64, state.height as f64)
            .min_inner_size(MIN_WIDTH as f64, MIN_HEIGHT as f64)
            .decorations(false)
            .transparent(true)
            .always_on_top(true)
            .resizable(true)
            .shadow(false)
            .visible(true);

        if let (Some(x), Some(y)) = (state.x, state.y) {
            builder = builder.position(x as f64, y as f64);
        }

        if let Ok(window) = builder.build() {
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let WindowEvent::Resized(size) = event {
                    enforce_aspect_ratio(&window_clone, size);
                }
            });

            // Update counter to avoid ID collisions
            if let Some(num) = state.id.strip_prefix("timer-") {
                if let Ok(n) = num.parse::<u32>() {
                    let current = WINDOW_COUNTER.load(Ordering::SeqCst);
                    if n >= current {
                        WINDOW_COUNTER.store(n + 1, Ordering::SeqCst);
                    }
                }
            }
        }
    }

    Ok(())
}

/// Get all window IDs
#[tauri::command]
async fn get_all_window_ids(app: AppHandle) -> Vec<String> {
    app.webview_windows()
        .keys()
        .cloned()
        .collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            let window = app
                .get_webview_window("main")
                .expect("main window not found");
            let window_clone = window.clone();

            // Register window event listener for aspect ratio enforcement
            window.on_window_event(move |event| {
                if let WindowEvent::Resized(size) = event {
                    enforce_aspect_ratio(&window_clone, size);
                }
            });

            // Emit event when window is about to close for state persistence
            let app_handle = app.handle().clone();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { .. } = event {
                    let _ = app_handle.emit("window-closing", "main");
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_window,
            close_window,
            get_window_state,
            restore_windows,
            get_all_window_ids,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Enforces the aspect ratio when the window is resized.
/// Adjusts the dimension that deviates most from the target ratio.
fn enforce_aspect_ratio(window: &tauri::WebviewWindow, size: &PhysicalSize<u32>) {
    let width = size.width as f64;
    let height = size.height as f64;

    let current_ratio = width / height;

    // Only adjust if the ratio is significantly different (avoid infinite loops)
    if (current_ratio - ASPECT_RATIO).abs() < 0.01 {
        return;
    }

    // Determine which dimension to adjust based on the current ratio
    let (new_width, new_height) = if current_ratio > ASPECT_RATIO {
        // Window is too wide, adjust width to match height
        let adjusted_width = (height * ASPECT_RATIO) as u32;
        (adjusted_width, size.height)
    } else {
        // Window is too tall, adjust height to match width
        let adjusted_height = (width / ASPECT_RATIO) as u32;
        (size.width, adjusted_height)
    };

    // Apply the corrected size
    let _ = window.set_size(tauri::Size::Physical(PhysicalSize {
        width: new_width,
        height: new_height,
    }));
}
