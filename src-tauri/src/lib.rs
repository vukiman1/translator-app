use serde::{Deserialize, Serialize};
use std::fs;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize)]
pub struct SRTFile {
    path: String,
    name: String,
    size: u64,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn select_folder(app: tauri::AppHandle) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;
    
    let folder = app.dialog()
        .file()
        .blocking_pick_folder();
    
    match folder {
        Some(path) => Ok(path.to_string()),
        None => Err("No folder selected".to_string()),
    }
}

#[tauri::command]
fn list_srt_files(folder_path: String) -> Result<Vec<SRTFile>, String> {
    let mut srt_files = Vec::new();
    
    for entry in WalkDir::new(&folder_path)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        
        if path.is_file() {
            if let Some(extension) = path.extension() {
                if extension == "srt" {
                    let metadata = fs::metadata(path)
                        .map_err(|e| format!("Failed to read metadata: {}", e))?;
                    
                    srt_files.push(SRTFile {
                        path: path.to_string_lossy().to_string(),
                        name: path
                            .file_name()
                            .unwrap_or_default()
                            .to_string_lossy()
                            .to_string(),
                        size: metadata.len(),
                    });
                }
            }
        }
    }
    
    Ok(srt_files)
}

#[tauri::command]
fn read_srt_file(file_path: String) -> Result<String, String> {
    fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
fn write_srt_file(file_path: String, content: String) -> Result<(), String> {
    fs::write(&file_path, content)
        .map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
fn delete_file(file_path: String) -> Result<(), String> {
    fs::remove_file(&file_path)
        .map_err(|e| format!("Failed to delete file: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            select_folder,
            list_srt_files,
            read_srt_file,
            write_srt_file,
            delete_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
