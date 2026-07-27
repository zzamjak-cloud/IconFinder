// 명령어 모듈
mod commands;

// Tauri 명령어 등록
use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Tauri 플러그인 등록
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                app.handle()
                    .plugin(tauri_plugin_updater::Builder::new().build())?;
            }
            Ok(())
        })
        // 명령어 핸들러 등록
        .invoke_handler(tauri::generate_handler![
            save_icon_file,
            read_text_file,
            change_svg_color,
            setup_default_folder,
        ])
        .run(tauri::generate_context!())
        .expect("Tauri 앱 실행 오류");
}
