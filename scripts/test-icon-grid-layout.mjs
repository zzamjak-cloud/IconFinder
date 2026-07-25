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

  const tempDir = await mkdtemp(path.join(tmpdir(), 'icon-grid-layout-'));
  const tempModule = path.join(tempDir, 'module.mjs');
  await writeFile(tempModule, outputText, 'utf8');

  try {
    return await import(pathToFileURL(tempModule).href);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

const {
  getIconGridMetrics,
  getIconGridRowStyle,
  getIconGridTotalHeight,
  getIconGridVirtualizerKey,
} = await importTypeScriptModule('src/components/iconGridLayout.ts');

const denseMetrics = getIconGridMetrics(1000, 10);
const spaciousMetrics = getIconGridMetrics(1000, 5);

assert.equal(
  denseMetrics.rowPitch,
  denseMetrics.cardHeight + denseMetrics.gridGap,
  'rowPitch는 카드 높이와 그리드 gap을 함께 포함해야 한다.',
);
assert.ok(
  spaciousMetrics.rowPitch > denseMetrics.rowPitch,
  '컬럼 수를 줄이면 카드가 커지는 만큼 rowPitch도 커져야 한다.',
);

const rowStyle = getIconGridRowStyle({
  columnCount: 5,
  gridGap: spaciousMetrics.gridGap,
  rowPitch: spaciousMetrics.rowPitch,
  rowIndex: 1,
});

assert.equal(
  rowStyle.transform,
  `translateY(${spaciousMetrics.rowPitch}px)`,
  'row 위치는 stale virtualRow.start가 아니라 현재 rowPitch와 row index로 계산해야 한다.',
);
assert.equal(
  rowStyle.height,
  `${spaciousMetrics.rowPitch}px`,
  'row 높이는 stale virtualRow.size가 아니라 현재 rowPitch를 따라야 한다.',
);
assert.equal(
  getIconGridTotalHeight(12, spaciousMetrics.rowPitch),
  12 * spaciousMetrics.rowPitch,
  '전체 scroll 높이도 stale virtualizer totalSize가 아니라 현재 rowPitch를 따라야 한다.',
);
assert.notEqual(
  rowStyle.height,
  `${denseMetrics.rowPitch}px`,
  '컬럼 변경 후 row 높이가 이전 컬럼 pitch에 머물면 행이 겹친다.',
);
assert.equal(
  rowStyle.paddingBottom,
  `${spaciousMetrics.gridGap}px`,
  '행 사이 gap은 row 내부 paddingBottom으로 보존해야 한다.',
);
assert.notEqual(
  getIconGridVirtualizerKey(10, denseMetrics.rowPitch, 0),
  getIconGridVirtualizerKey(5, spaciousMetrics.rowPitch, 0),
  '컬럼 또는 rowPitch가 바뀌면 virtualizer 측정 cache key도 바뀌어야 한다.',
);
