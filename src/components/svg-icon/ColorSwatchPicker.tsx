import { useEffect, useRef, useState } from 'react';

// 큰 컬러칩 팝업을 제공하는 커스텀 색상 선택기.
// (네이티브 <input type="color">의 OS 팝업은 칩 크기를 제어할 수 없어 별도 구현)

// HSL → HEX 변환
function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// OS 색상 선택기와 유사하게: 회색조 1행 + 색상(12) × 명암(8) 그리드 = 총 108색
const HUES = Array.from({ length: 12 }, (_, i) => i * 30); // 0~330°
const SHADES = [
  { s: 70, l: 92 },
  { s: 75, l: 82 },
  { s: 82, l: 70 },
  { s: 85, l: 58 },
  { s: 85, l: 48 },
  { s: 80, l: 38 },
  { s: 70, l: 28 },
  { s: 60, l: 18 },
];
const GRAYS = Array.from({ length: 12 }, (_, i) => hslToHex(0, 0, Math.round((i / 11) * 100)));
const PALETTE = [...GRAYS, ...SHADES.flatMap((shade) => HUES.map((h) => hslToHex(h, shade.s, shade.l)))];

const POPUP_WIDTH = 336;
const POPUP_EST_HEIGHT = 320;
const VIEWPORT_MARGIN = 8;

// 배경 밝기에 맞춰 칩 안쪽 라벨 대비색 선택
function contrastText(hex: string): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return '#ffffff';
  const n = parseInt(match[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? '#1e293b' : '#ffffff';
}

interface ColorSwatchPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string; // 트리거 스와치 크기/모양 (기본: h-12 w-full)
  disabled?: boolean;
  /** 칩 중앙에 표시할 짧은 라벨 (예: 메인/보조) */
  overlayLabel?: string;
}

export function ColorSwatchPicker({
  value,
  onChange,
  label,
  className,
  disabled,
  overlayLabel,
}: ColorSwatchPickerProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 트리거 위치 기준으로 화면 안에 들어오도록 팝업 좌표 계산(아래 공간 부족 시 위로 띄움)
  const computePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.min(Math.max(VIEWPORT_MARGIN, rect.left), window.innerWidth - POPUP_WIDTH - VIEWPORT_MARGIN);
    let top = rect.bottom + 4;
    if (top + POPUP_EST_HEIGHT > window.innerHeight - VIEWPORT_MARGIN) {
      const above = rect.top - POPUP_EST_HEIGHT - 4;
      top = above >= VIEWPORT_MARGIN ? above : Math.max(VIEWPORT_MARGIN, window.innerHeight - POPUP_EST_HEIGHT - VIEWPORT_MARGIN);
    }
    setPos({ left, top });
  };

  const toggle = () => {
    if (disabled) return;
    if (!open) computePosition();
    setOpen((o) => !o);
  };

  // 비활성화되면 팝업을 닫는다
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  // 바깥 클릭 / ESC / 스크롤·리사이즈 시 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onScroll = () => setOpen(false);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={`inline-flex items-center justify-center rounded-md border border-slate-200 ${className ?? 'h-12 w-full'} ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
        style={{ backgroundColor: value }}
        aria-label={label}
      >
        {overlayLabel ? (
          <span
            className="pointer-events-none text-[10px] font-bold leading-none"
            style={{ color: contrastText(value) }}
          >
            {overlayLabel}
          </span>
        ) : null}
      </button>
      {open && pos && (
        <div
          style={{ position: 'fixed', left: pos.left, top: pos.top, width: POPUP_WIDTH }}
          className="z-50 max-h-[calc(100vh-16px)] max-w-[calc(100vw-16px)] overflow-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xl"
        >
          <div className="grid grid-cols-12 gap-1">
            {PALETTE.map((color, index) => (
              <button
                key={`${color}-${index}`}
                type="button"
                onClick={() => {
                  onChange(color);
                  setOpen(false);
                }}
                className={`aspect-square w-full rounded-[3px] border ${
                  value.toLowerCase() === color.toLowerCase()
                    ? 'border-slate-900 ring-2 ring-slate-400'
                    : 'border-black/10 hover:border-slate-400'
                }`}
                style={{ backgroundColor: color }}
                aria-label={color}
              />
            ))}
          </div>
          {/* 직접 선택(네이티브) + HEX 입력 */}
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="h-8 w-10 shrink-0 cursor-pointer rounded-md border border-slate-200"
            />
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="h-8 w-full rounded-md border border-slate-200 px-2 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
