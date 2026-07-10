import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, MoreHorizontal } from "lucide-react";

interface RowActionMenuProps {
  children: ReactNode;
  width?: number;
  /** "default" = filled purple MoreVertical (master data list tables). "subtle" =
   *  bordered MoreHorizontal (compact population tables). */
  variant?: "default" | "subtle";
}

const MENU_WIDTH_DEFAULT = 144;

// Table action ("⋮") menus used to be position:absolute inside each list's
// overflow-x-auto wrapper. Any table needs overflow-x-auto for horizontal
// scrolling, but per the CSS spec a container can't have overflow-x auto/scroll
// and overflow-y visible at the same time — the browser silently forces
// overflow-y to auto too, which clips an absolutely-positioned dropdown the
// moment it would extend past the wrapper's bottom edge (rows near the end of
// the table, or the last row on a page). This renders the menu via a portal to
// document.body with fixed coordinates from the trigger button's own bounding
// rect, so it always escapes that clipping regardless of which row it's on.
export default function RowActionMenu({ children, width = MENU_WIDTH_DEFAULT, variant = "default" }: RowActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const left = Math.min(rect.right - width, window.innerWidth - width - 8);
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow < 120 ? rect.top - 8 - 88 : rect.bottom + 4;
      setCoords({ top: Math.max(8, top), left: Math.max(8, left) });
    }
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;
    function close() {
      setOpen(false);
    }
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className={
          variant === "subtle"
            ? "p-1 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50"
            : "p-1.5 rounded-lg bg-[#5B5FC7] text-white hover:bg-indigo-700 transition-colors"
        }
      >
        {variant === "subtle" ? <MoreHorizontal className="w-3.5 h-3.5" /> : <MoreVertical className="w-4 h-4" />}
      </button>
      {open &&
        coords &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ position: "fixed", top: coords.top, left: coords.left, width }}
              className="z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
              onClick={() => setOpen(false)}
            >
              {children}
            </div>
          </>,
          document.body
        )}
    </>
  );
}
