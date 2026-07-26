import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

async function importTypeScriptModule(relativePath) {
  const sourcePath = path.resolve(relativePath);
  const source = await readFile(sourcePath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2020,
      strict: true,
    },
    fileName: sourcePath,
  });

  const tempDir = await mkdtemp(path.join(tmpdir(), 'svg-icon-panel-layout-'));
  const tempModule = path.join(tempDir, 'module.mjs');
  await writeFile(tempModule, outputText, 'utf8');

  try {
    return await import(pathToFileURL(tempModule).href);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

const {
  SVG_ICON_SEARCH_PAGE_SIZE,
  clampSvgIconSavedPaneHeight,
  getSvgIconGridMetrics,
  getSvgIconGridRowStyle,
  getSvgIconGridTotalHeight,
  getSvgIconSearchPageSlice,
  getSvgIconSavedPaneHeightFromDrag,
  getSvgIconSavedPaneHeightFromPointer,
} = await importTypeScriptModule('src/components/svg-icon/svgIconPanelLayout.ts');

assert.equal(
  SVG_ICON_SEARCH_PAGE_SIZE,
  48,
  '에디터 검색 결과는 효과 적용 비용을 제한하기 위해 페이지당 48개만 표시해야 한다.',
);

const names = Array.from({ length: 120 }, (_, index) => `icon-${index}`);
assert.deepEqual(
  getSvgIconSearchPageSlice(names, 1),
  names.slice(48, 96),
  '검색 결과 페이지 slice는 기본 page size 48을 사용해야 한다.',
);
assert.deepEqual(
  getSvgIconSearchPageSlice(names, 2),
  names.slice(96, 120),
  '마지막 페이지는 남은 검색 결과만 반환해야 한다.',
);

assert.equal(
  clampSvgIconSavedPaneHeight(80, 720),
  180,
  '저장된 아이콘 패널은 최소 높이보다 작아지면 안 된다.',
);
assert.equal(
  clampSvgIconSavedPaneHeight(620, 720),
  500,
  '상단 검색 결과 패널의 최소 높이를 남기도록 저장 패널 높이를 제한해야 한다.',
);
assert.equal(
  getSvgIconSavedPaneHeightFromPointer({ top: 100, bottom: 820 }, 520),
  300,
  '드래그 위치는 컨테이너 하단부터의 저장 패널 높이로 변환되어야 한다.',
);
assert.equal(
  getSvgIconSavedPaneHeightFromDrag({
    initialHeight: 300,
    startY: 520,
    currentY: 520,
    containerHeight: 720,
  }),
  300,
  '분할 핸들을 클릭만 했을 때는 저장 패널 높이가 바뀌면 안 된다.',
);
assert.equal(
  getSvgIconSavedPaneHeightFromDrag({
    initialHeight: 300,
    startY: 520,
    currentY: 600,
    containerHeight: 720,
  }),
  220,
  '분할 핸들을 아래로 드래그하면 저장 패널 높이는 이동량만큼 줄어야 한다.',
);
assert.equal(
  getSvgIconSavedPaneHeightFromDrag({
    initialHeight: 300,
    startY: 520,
    currentY: 440,
    containerHeight: 720,
  }),
  380,
  '분할 핸들을 위로 드래그하면 저장 패널 높이는 이동량만큼 늘어야 한다.',
);

const searchMetrics = getSvgIconGridMetrics(960, 6, 'search');
const savedMetrics = getSvgIconGridMetrics(960, 6, 'saved');

assert.equal(
  searchMetrics.rowPitch,
  savedMetrics.rowPitch,
  '검색/저장 카드는 동일 골격이므로 row pitch가 같아야 한다.',
);
assert.equal(
  getSvgIconGridTotalHeight(7, searchMetrics.rowPitch),
  7 * searchMetrics.rowPitch,
  '가상 그리드 전체 높이는 row count와 row pitch로 계산해야 한다.',
);

const rowStyle = getSvgIconGridRowStyle({
  columnCount: 6,
  gridGap: searchMetrics.gridGap,
  rowPitch: searchMetrics.rowPitch,
  rowIndex: 3,
});

assert.equal(
  rowStyle.transform,
  `translateY(${searchMetrics.rowPitch * 3}px)`,
  '가상 row 위치는 현재 row pitch와 row index로 계산해야 한다.',
);
assert.equal(
  rowStyle.gridTemplateColumns,
  'repeat(6, minmax(0, 1fr))',
  '가상 row는 현재 컬럼 수를 반영해야 한다.',
);
