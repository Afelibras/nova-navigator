import { useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function BottomSheet({ children }: Props) {
  const [open, setOpen] = useState(true);
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    startY.current = e.clientY;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startY.current == null) return;
    const dy = e.clientY - startY.current;
    setDragY(Math.max(-40, Math.min(360, dy)));
  }
  function onPointerUp() {
    if (startY.current == null) return;
    if (dragY > 80) setOpen(false);
    if (dragY < -20) setOpen(true);
    setDragY(0);
    startY.current = null;
  }

  const translate = open ? `translateY(${dragY}px)` : `translateY(calc(100% - 88px))`;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{
        transform: translate,
        transition: startY.current ? "none" : "transform 0.4s cubic-bezier(.2,.8,.2,1)",
      }}
    >
      <div className="glass-strong rounded-t-3xl border-b-0 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div
          className="mx-auto mb-2 flex h-6 w-full max-w-[120px] cursor-grab touch-none items-center justify-center active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="h-1.5 w-12 rounded-full bg-white/30" />
        </div>
        {children}
      </div>
    </div>
  );
}
