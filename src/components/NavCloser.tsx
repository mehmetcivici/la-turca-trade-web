"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Sayfa değişince üstteki <details> mobil menüsünü kapatır. */
export function NavCloser() {
  const ref = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    ref.current?.closest("details")?.removeAttribute("open");
  }, [pathname]);
  return <span ref={ref} hidden />;
}
