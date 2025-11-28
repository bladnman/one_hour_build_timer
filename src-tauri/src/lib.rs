use tauri::{Manager, PhysicalSize, WindowEvent};

/// Aspect ratio for the timer window (width / height)
/// 2.5:1 ratio provides a compact format for HH:MM:SS display
const ASPECT_RATIO: f64 = 2.5;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            let window = app.get_webview_window("main").expect("main window not found");
            let window_clone = window.clone();

            // Register window event listener for aspect ratio enforcement
            window.on_window_event(move |event| {
                if let WindowEvent::Resized(size) = event {
                    enforce_aspect_ratio(&window_clone, size);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
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
