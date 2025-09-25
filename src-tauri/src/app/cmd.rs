use log::{error, info};
use mouse_position::mouse_position::Mouse;
use serde_json::json;

// Platform-specific imports for context awareness
#[cfg(target_os = "windows")]
use winapi::um::winuser::{GetForegroundWindow, GetWindowTextW};
#[cfg(target_os = "windows")]
use winapi::shared::windef::HWND;

// Cross-platform clipboard
#[cfg(target_os = "windows")]
use clipboard_win::get_clipboard_string;

#[cfg(not(target_os = "windows"))]
use arboard::Clipboard;

#[tauri::command]
pub fn get_mouse_position() -> serde_json::Value {
    /*
     * because we set the window to ignore cursor events, we cannot use 
     * javascript to get the mouse position, so we use get mouse position manually
     */
    let position = Mouse::get_mouse_position();
    match position {
        Mouse::Position { x, y } => {
            json!({
                "clientX": x,
                "clientY": y
            })
        }
        Mouse::Error => {
            error!("Error getting mouse position");
            println!("Error getting mouse position");
            json!(null)
        }
    }
}

#[tauri::command]
pub fn open_folder(path: &str) {
    match open::that(path) {
        Ok(()) => info!("Open folder: {}", path),
        Err(err) => error!("An error occurred when opening '{}': {}", path, err),
    }
}

/// 📋 Get clipboard text content
#[tauri::command]
pub fn get_clipboard_text() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        match get_clipboard_string() {
            Ok(text) => {
                info!("Clipboard read successfully ({} chars)", text.len());
                Ok(text)
            }
            Err(e) => {
                error!("Failed to read clipboard: {}", e);
                Err(format!("Failed to read clipboard: {}", e))
            }
        }
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        match Clipboard::new() {
            Ok(mut clipboard) => {
                match clipboard.get_text() {
                    Ok(text) => {
                        info!("Clipboard read successfully ({} chars)", text.len());
                        Ok(text)
                    }
                    Err(e) => {
                        error!("Failed to read clipboard: {}", e);
                        Err(format!("Failed to read clipboard: {}", e))
                    }
                }
            }
            Err(e) => {
                error!("Failed to access clipboard: {}", e);
                Err(format!("Failed to access clipboard: {}", e))
            }
        }
    }
}

/// ⚡ Execute shell command
#[tauri::command]
pub fn execute_shell_command(command: &str) -> Result<String, String> {
    info!("Executing shell command: {}", command);
    
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        
        match Command::new("cmd")
            .args(&["/C", command])
            .output()
        {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                
                if output.status.success() {
                    info!("Command executed successfully: {}", command);
                    Ok(stdout.to_string())
                } else {
                    error!("Command failed: {} - Error: {}", command, stderr);
                    Err(format!("Command failed: {}", stderr))
                }
            }
            Err(e) => {
                error!("Failed to execute command: {} - Error: {}", command, e);
                Err(format!("Failed to execute command: {}", e))
            }
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        
        match Command::new("sh")
            .args(&["-c", command])
            .output()
        {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                
                if output.status.success() {
                    info!("Command executed successfully: {}", command);
                    Ok(stdout.to_string())
                } else {
                    error!("Command failed: {} - Error: {}", command, stderr);
                    Err(format!("Command failed: {}", stderr))
                }
            }
            Err(e) => {
                error!("Failed to execute command: {} - Error: {}", command, e);
                Err(format!("Failed to execute command: {}", e))
            }
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        use std::process::Command;
        
        match Command::new("sh")
            .args(&["-c", command])
            .output()
        {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                
                if output.status.success() {
                    info!("Command executed successfully: {}", command);
                    Ok(stdout.to_string())
                } else {
                    error!("Command failed: {} - Error: {}", command, stderr);
                    Err(format!("Command failed: {}", stderr))
                }
            }
            Err(e) => {
                error!("Failed to execute command: {} - Error: {}", command, e);
                Err(format!("Failed to execute command: {}", e))
            }
        }
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("Shell command execution not supported on this platform".to_string())
    }
}

/// 🪟 Get active window title
#[tauri::command]
pub fn get_active_window_title() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        unsafe {
            let hwnd: HWND = GetForegroundWindow();
            if hwnd.is_null() {
                return Err("No active window found".to_string());
            }
            
            let mut buffer: [u16; 512] = [0; 512];
            let length = GetWindowTextW(hwnd, buffer.as_mut_ptr(), buffer.len() as i32);
            
            if length == 0 {
                return Err("Failed to get window title".to_string());
            }
            
            let title = String::from_utf16_lossy(&buffer[0..length as usize]);
            info!("Active window: {}", title);
            Ok(title)
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        
        match Command::new("osascript")
            .arg("-e")
            .arg("tell application \"System Events\" to get name of first application process whose frontmost is true")
            .output()
        {
            Ok(output) => {
                let title = String::from_utf8_lossy(&output.stdout).trim().to_string();
                info!("Active window (macOS): {}", title);
                Ok(title)
            }
            Err(e) => {
                error!("Failed to get active window on macOS: {}", e);
                Err(format!("Failed to get active window: {}", e))
            }
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        use std::process::Command;
        
        // Try xdotool first
        if let Ok(output) = Command::new("xdotool")
            .args(&["getactivewindow", "getwindowname"])
            .output()
        {
            if output.status.success() {
                let title = String::from_utf8_lossy(&output.stdout).trim().to_string();
                info!("Active window (Linux): {}", title);
                return Ok(title);
            }
        }
        
        // Fallback to xprop
        if let Ok(output) = Command::new("xprop")
            .args(&["-id", "$(xprop -root _NET_ACTIVE_WINDOW | cut -d' ' -f5)", "WM_NAME"])
            .output()
        {
            if output.status.success() {
                let raw = String::from_utf8_lossy(&output.stdout);
                // Parse xprop output: WM_NAME(STRING) = "Title"
                if let Some(start) = raw.find('"') {
                    if let Some(end) = raw.rfind('"') {
                        if end > start {
                            let title = raw[start + 1..end].to_string();
                            info!("Active window (Linux): {}", title);
                            return Ok(title);
                        }
                    }
                }
            }
        }
        
        Err("Failed to get active window on Linux".to_string())
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("Window detection not supported on this platform".to_string())
    }
}
