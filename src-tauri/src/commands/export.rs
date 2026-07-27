use tauri::command;
use serde::Deserialize;
use std::fmt::Display;
use std::fs;
use std::io::Cursor;
use std::path::Path;

/// 프론트에서 전달하는 PNG 엔트리 (Canvas 래스터 결과)
#[derive(Debug, Deserialize)]
pub struct PngEntry {
    pub size: u32,
    pub png: Vec<u8>,
}


/// 번역 가능한 에러 코드를 만든다 (세부 내용 없음).
///
/// UI는 `src/i18n/errorMessage.ts`의 프로토콜(`i18n:<번역키>`)에 따라
/// 이 문자열을 현재 언어 문장으로 변환한다.
fn i18n_err(key: &str) -> String {
    format!("i18n:{}", key)
}

/// 번역 가능한 에러 코드를 만든다 (`i18n:<번역키>|<세부내용>`).
///
/// 세부 내용은 번역 문장의 `{detail}` 자리에 들어간다.
fn i18n_err_detail(key: &str, detail: impl Display) -> String {
    format!("i18n:{}|{}", key, detail)
}

/// 파일 저장 (부모 디렉터리가 없으면 생성)
///
/// # Arguments
/// * `file_path` - 저장할 파일 경로
/// * `content` - 파일 내용 (바이트 배열)
#[command]
pub async fn save_icon_file(file_path: String, content: Vec<u8>) -> Result<(), String> {
    if let Some(parent) = Path::new(&file_path).parent() {
        if !parent.as_os_str().is_empty() {
            fs::create_dir_all(parent)
                .map_err(|e| i18n_err_detail("error.rust.createDir", e))?;
        }
    }

    fs::write(&file_path, content)
        .map_err(|e| i18n_err_detail("error.rust.fileSave", e))?;

    Ok(())
}

/// 지정한 절대 경로의 텍스트 파일을 읽어 문자열로 반환 (설정 백업 복원용)
#[command]
pub async fn read_text_file(file_path: String) -> Result<String, String> {
    use std::fs;

    fs::read_to_string(&file_path)
        .map_err(|e| i18n_err_detail("error.rust.fileRead", e))
}

/// SVG의 currentColor를 지정된 색상으로 변경
///
/// # Arguments
/// * `svg_content` - 원본 SVG 문자열
/// * `new_color` - 새 색상 (hex 형식, 예: "#FF0000")
///
/// # Returns
/// 색상이 변경된 SVG 문자열
#[command]
pub fn change_svg_color(svg_content: String, new_color: String) -> Result<String, String> {
    // currentColor를 새 색상으로 교체 (속성 형식)
    let mut modified = svg_content
        .replace(r#"fill="currentColor""#, &format!(r#"fill="{}""#, new_color))
        .replace(r#"fill='currentColor'"#, &format!(r#"fill='{}'"#, new_color))
        .replace(r#"stroke="currentColor""#, &format!(r#"stroke="{}""#, new_color))
        .replace(r#"stroke='currentColor'"#, &format!(r#"stroke='{}'"#, new_color));

    // style 속성 내의 currentColor도 교체
    // style="fill:currentColor" 또는 style="stroke:currentColor" 형식
    modified = modified
        .replace("fill:currentColor", &format!("fill:{}", new_color))
        .replace("stroke:currentColor", &format!("stroke:{}", new_color));

    // "currentColor" 문자열 자체도 모두 교체 (다른 형식에서 사용될 수 있음)
    modified = modified.replace("currentColor", &new_color);

    Ok(modified)
}

/// 시스템 다운로드 폴더에 Download_Icon 폴더 생성 및 경로 반환
///
/// # Returns
/// Download_Icon 폴더의 절대 경로
#[command]
pub fn setup_default_folder() -> Result<String, String> {
    // 다운로드 폴더 경로 가져오기
    let download_dir = dirs::download_dir()
        .ok_or_else(|| i18n_err("error.rust.noDownloadDir"))?;

    // Download_Icon 폴더 경로
    let icon_folder = download_dir.join("Download_Icon");

    // 폴더가 없으면 생성
    if !icon_folder.exists() {
        fs::create_dir_all(&icon_folder)
            .map_err(|e| i18n_err_detail("error.rust.createDir", e))?;
        println!("Created Download_Icon folder at: {:?}", icon_folder);
    } else {
        println!("Download_Icon folder already exists at: {:?}", icon_folder);
    }

    // 경로를 문자열로 반환
    icon_folder
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| i18n_err("error.rust.pathConvert"))
}

/// PNG 엔트리들을 ICO 컨테이너로 패키징해 저장 (크기 16~256)
#[command]
pub async fn create_ico(entries: Vec<PngEntry>, file_path: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&file_path).parent() {
        if !parent.as_os_str().is_empty() {
            fs::create_dir_all(parent)
                .map_err(|e| i18n_err_detail("error.rust.createDir", e))?;
        }
    }

    let mut icon_dir = ico::IconDir::new(ico::ResourceType::Icon);
    for entry in entries {
        if entry.size < 16 || entry.size > 256 {
            return Err(i18n_err("error.rust.icoSize"));
        }
        let image = ico::IconImage::read_png(Cursor::new(&entry.png))
            .map_err(|e| i18n_err_detail("error.rust.icoEncode", e))?;
        let encoded = ico::IconDirEntry::encode(&image)
            .map_err(|e| i18n_err_detail("error.rust.icoEncode", e))?;
        icon_dir.add_entry(encoded);
    }

    let file = fs::File::create(&file_path)
        .map_err(|e| i18n_err_detail("error.rust.fileSave", e))?;
    icon_dir
        .write(file)
        .map_err(|e| i18n_err_detail("error.rust.icoEncode", e))?;
    Ok(())
}

/// PNG 엔트리들을 ICNS 컨테이너로 패키징해 저장 (크기 16~1024)
#[command]
pub async fn create_icns(entries: Vec<PngEntry>, file_path: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&file_path).parent() {
        if !parent.as_os_str().is_empty() {
            fs::create_dir_all(parent)
                .map_err(|e| i18n_err_detail("error.rust.createDir", e))?;
        }
    }

    let mut family = icns::IconFamily::new();
    for entry in entries {
        if entry.size < 16 || entry.size > 1024 {
            return Err(i18n_err("error.rust.icnsSize"));
        }
        let image = icns::Image::read_png(Cursor::new(&entry.png))
            .map_err(|e| i18n_err_detail("error.rust.icnsEncode", e))?;
        family
            .add_icon(&image)
            .map_err(|e| i18n_err_detail("error.rust.icnsEncode", e))?;
    }

    let file = fs::File::create(&file_path)
        .map_err(|e| i18n_err_detail("error.rust.fileSave", e))?;
    family
        .write(file)
        .map_err(|e| i18n_err_detail("error.rust.icnsEncode", e))?;
    Ok(())
}
