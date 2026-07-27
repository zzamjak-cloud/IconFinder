import * as React from "react"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  // ESC로 닫기
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      onOpenChange?.(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 딤은 별도 레이어 — 전체 영역 클릭으로 닫힘 (콘텐츠 래퍼가 가로를 가로채지 않음) */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
        aria-hidden
      />
      {/* 레이아웃만 담당. pointer-events-none으로 딤 클릭이 통과하고, 카드만 auto */}
      <div className="relative z-10 flex max-h-full min-h-0 w-full justify-center pointer-events-none">
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "pointer-events-auto bg-card border border-border rounded-lg shadow-xl w-full max-w-md",
        // 앱 창이 작아져도 잘리지 않도록 뷰포트 높이에 맞추고 넘치는 내용은 스크롤
        "max-h-[calc(100vh-2rem)] overflow-y-auto p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}
