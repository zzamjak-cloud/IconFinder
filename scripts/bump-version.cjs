#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const arg = process.argv[2];
if (!arg) {
  console.error('❌ 버전을 지정하세요. 예: node scripts/bump-version.js 1.0.0');
  console.error('또는: node scripts/bump-version.js patch|minor|major');
  process.exit(1);
}

// 현재 버전
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const currentVersion = packageJson.version;

// 새 버전 계산
let newVersion;
if (arg === 'patch' || arg === 'minor' || arg === 'major') {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  switch (arg) {
    case 'patch': newVersion = `${major}.${minor}.${patch + 1}`; break;
    case 'minor': newVersion = `${major}.${minor + 1}.0`; break;
    case 'major': newVersion = `${major + 1}.0.0`; break;
  }
} else {
  newVersion = arg;
}

console.log(`📦 버전 업데이트: ${currentVersion} → ${newVersion}`);

// 1. package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ package.json');

// 2. Cargo.toml
const cargoTomlPath = path.join(__dirname, '..', 'src-tauri', 'Cargo.toml');
let cargoToml = fs.readFileSync(cargoTomlPath, 'utf-8');
cargoToml = cargoToml.replace(/^version = ".*"/m, `version = "${newVersion}"`);
fs.writeFileSync(cargoTomlPath, cargoToml);
console.log('✅ Cargo.toml');

// 3. tauri.conf.json
const tauriConfPath = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf-8'));
tauriConf.version = newVersion;
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log('✅ tauri.conf.json');

console.log(`\n🎉 버전 ${newVersion}로 업데이트 완료!`);
console.log('\n다음 단계:');
console.log(`  git add .`);
console.log(`  git commit -m "chore: bump version to ${newVersion}"`);
console.log(`  git tag v${newVersion}`);
console.log(`  git push && git push --tags`);
