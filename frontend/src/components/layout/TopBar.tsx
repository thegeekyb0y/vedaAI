"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, ArrowLeft, LayoutGrid } from "lucide-react";

const getTitle = (pathname: string): string => {
  if (
    pathname.startsWith("/assignments/") &&
    pathname !== "/assignments/create"
  )
    return "Create Now";
  return "Assignment";
};

export const Topbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const showBack = pathname !== "/assignments";

  return (
    <header className="fixed top-0 left-(--sidebar-width) right-0 h-(--topbar-height) bg-(--color-surface) border-b border-(--color-border) shadow-(--shadow-topbar) flex items-center justify-between px-6 z-30">
      {/* Left */}
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="text-(--color-muted) hover:text-(--color-primary) transition-colors p-1 rounded-(--radius-sm)"
          >
            <ArrowLeft size={16} strokeWidth={2} />
          </button>
        )}
        <LayoutGrid
          size={14}
          strokeWidth={1.8}
          className="text-(--color-muted)"
        />
        <span className="text-[13px] font-medium text-(--color-secondary)">
          {getTitle(pathname)}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="relative text-(--color-secondary) hover:text-(--color-primary) transition-colors p-1">
          <Bell size={17} strokeWidth={1.8} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-(--color-orange) rounded-full border-2 border-(--color-surface)" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-(--color-orange)">
            JD
          </div>
          <span className="text-[13px] font-semibold text-(--color-primary)">
            John Doe
          </span>
          <ChevronDown
            size={13}
            strokeWidth={2}
            className="text-(--color-muted)"
          />
        </div>
      </div>
    </header>
  );
};
