# GitHub Secrets 설정 가이드

IconFinder 프로젝트의 자동 빌드 및 업데이트 시스템을 위한 GitHub Secrets 설정 방법입니다.

## 필수 Secret

### 1. TAURI_SIGNING_PRIVATE_KEY

**경로**: https://github.com/zzamjak-cloud/IconFinder/settings/secrets/actions

**값**: `src-tauri/iconfinder.key` 파일의 전체 내용

**설정 방법:**

#### Windows (PowerShell)
```powershell
# 1. 파일 내용 복사
Get-Content src-tauri\iconfinder.key | Set-Clipboard

# 2. GitHub Secrets 페이지로 이동
# https://github.com/zzamjak-cloud/IconFinder/settings/secrets/actions

# 3. "New repository secret" 클릭

# 4. Name: TAURI_SIGNING_PRIVATE_KEY

# 5. Secret: Ctrl+V로 붙여넣기

# 6. "Add secret" 클릭
```

#### Windows (Git Bash)
```bash
# 1. 파일 내용 출력
cat src-tauri/iconfinder.key

# 2. 출력된 내용 전체를 복사 (Ctrl+A, Ctrl+C)

# 3. GitHub Secrets 페이지에서 붙여넣기
```

#### macOS/Linux
```bash
# 1. 파일 내용 클립보드에 복사
cat src-tauri/iconfinder.key | pbcopy  # macOS
cat src-tauri/iconfinder.key | xclip -selection clipboard  # Linux

# 2. GitHub Secrets 페이지에서 Cmd+V/Ctrl+V로 붙여넣기
```

### 2. TAURI_SIGNING_PRIVATE_KEY_PASSWORD (선택 사항)

**현재 상태**: 비밀번호 없이 키를 생성했으므로 **설정하지 않아도 됩니다**.

**만약 비밀번호가 있는 키를 사용한다면:**
- Name: `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- Secret: 키 생성 시 입력한 비밀번호

⚠️ **주의**: 이 Secret은 비워둘 수 없습니다. 비밀번호가 없다면 Secret 자체를 생성하지 마세요.

---

## GitHub Actions 권한 설정

**경로**: https://github.com/zzamjak-cloud/IconFinder/settings/actions

### 설정 항목:

1. **Workflow permissions**
   - ✅ "Read and write permissions" 선택
   - ✅ "Allow GitHub Actions to create and approve pull requests" 체크

2. **Actions permissions**
   - ✅ "Allow all actions and reusable workflows" 선택

3. **Save** 클릭

---

## 검증 방법

### 1. Secret 설정 확인
```
https://github.com/zzamjak-cloud/IconFinder/settings/secrets/actions
```

다음과 같이 표시되어야 합니다:
```
TAURI_SIGNING_PRIVATE_KEY    Updated XX minutes ago
```

### 2. 테스트 릴리스
```bash
# 테스트용 태그 생성
git tag v0.1.1-test
git push --tags

# GitHub Actions 확인
# https://github.com/zzamjak-cloud/IconFinder/actions
```

### 3. 빌드 성공 확인
- ✅ Windows 빌드 성공
- ✅ macOS 빌드 성공
- ✅ Draft Release 생성됨
- ✅ 서명된 파일 (.sig) 생성됨

---

## 문제 해결

### 문제 1: "TAURI_SIGNING_PRIVATE_KEY가 설정되지 않았습니다"

**원인**: Secret이 제대로 설정되지 않음

**해결**:
1. Secret 값에 줄바꿈 포함 여부 확인
2. 키 파일 전체를 복사했는지 확인
3. Secret 이름 철자 확인 (대소문자 구분)

### 문제 2: "Invalid signing key"

**원인**: 공개 키와 비밀 키가 일치하지 않음

**해결**:
1. `src-tauri/iconfinder.key.pub` 내용 확인
2. `src-tauri/tauri.conf.json`의 `plugins.updater.pubkey` 값 확인
3. 두 값이 일치하는지 확인

### 문제 3: 빌드는 성공하지만 업데이트가 작동하지 않음

**원인**: 서명이 올바르게 적용되지 않음

**확인 사항**:
1. Release에 `.sig` 파일이 포함되어 있는지 확인
2. `latest.json` 파일이 생성되었는지 확인
3. `tauri.conf.json`의 `createUpdaterArtifacts: true` 설정 확인

### 문제 4: macOS 빌드 실패 - "No Developer Program membership"

**원인**: Apple Developer 계정 없음 (코드 서명 시도)

**임시 해결**:
현재는 서명 없이 빌드하므로 문제가 발생하지 않습니다. 향후 macOS 앱 서명이 필요한 경우:
1. Apple Developer Program 가입 ($99/년)
2. Certificate 및 Provisioning Profile 설정
3. GitHub Secrets에 추가 설정

---

## 키 파일 백업

⚠️ **중요**: `src-tauri/iconfinder.key` 파일은 절대 잃어버리면 안 됩니다!

### 백업 방법

1. **안전한 위치에 저장**
   - 암호화된 USB 드라이브
   - 비밀번호 관리자 (1Password, Bitwarden 등)
   - 클라우드 저장소 (암호화된 zip 파일)

2. **백업 검증**
   ```bash
   # 백업한 키와 원본 비교
   diff src-tauri/iconfinder.key /path/to/backup/iconfinder.key
   ```

3. **복구 테스트**
   - 백업에서 키를 복원해보기
   - 빌드 및 서명 테스트

---

## 보안 주의사항

1. ❌ **절대 커밋하지 마세요**
   - `.gitignore`에 `src-tauri/*.key` 추가됨
   - Git 히스토리에 키가 없는지 확인

2. ❌ **공개 채널에 공유하지 마세요**
   - 슬랙, 이메일, 이슈 트래커 등
   - 스크린샷 주의

3. ✅ **키 교체 시기**
   - 키가 유출된 경우 즉시 교체
   - 팀원 퇴사 시 교체 고려
   - 정기적 교체 (1-2년마다)

4. ✅ **키 교체 방법**
   ```bash
   # 1. 새 키 생성
   npm run tauri signer generate -- -w src-tauri/iconfinder-new.key

   # 2. tauri.conf.json 업데이트
   # 3. GitHub Secret 업데이트
   # 4. 테스트 릴리스
   # 5. 이전 키 삭제
   ```

---

## 요약 체크리스트

설정을 완료하려면 다음 항목을 확인하세요:

- [ ] `TAURI_SIGNING_PRIVATE_KEY` Secret 생성 완료
- [ ] GitHub Actions "Read and write permissions" 설정 완료
- [ ] 키 파일 백업 완료
- [ ] 테스트 릴리스 성공
- [ ] `.sig` 파일 생성 확인
- [ ] `latest.json` 파일 생성 확인

모든 항목을 완료했다면 이제 자동 빌드 및 업데이트 시스템이 준비되었습니다! 🚀
