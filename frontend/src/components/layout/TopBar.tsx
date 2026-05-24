"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, ChevronDown, ArrowLeft, LayoutGrid } from "lucide-react";

const getTitle = (pathname: string): string => {
  if (pathname === "/assignments") return "Assignment";
  if (pathname === "/assignments/create") return "Create Assignment";
  if (
    pathname.startsWith("/assignments/") &&
    pathname !== "/assignments/create"
  )
    return "Generated Paper";
  return "Workspace";
};

export const Topbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const showBack = pathname !== "/assignments" && pathname !== "/";

  return (
    <header className="print-hidden fixed left-0 right-0 top-0 z-30 lg:left-[calc(var(--sidebar-width)+var(--shell-gap)+(var(--shell-pad)*2))] lg:right-[var(--shell-pad)] lg:top-[var(--shell-pad)]">
      <div className="mx-auto flex h-[var(--topbar-height)] items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/92 px-4 shadow-topbar backdrop-blur sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {showBack ? (
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-colors hover:text-primary"
            >
              <ArrowLeft size={16} strokeWidth={2} />
            </button>
          ) : null}
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-9 w-9 items-center justify-center text-muted sm:flex">
              <LayoutGrid size={16} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold text-secondary">
                {getTitle(pathname)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-colors hover:text-primary">
            <Bell size={17} strokeWidth={1.8} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange" />
          </button>

          <div className="flex items-center gap-3 rounded-full bg-white px-1 py-1">
            <Image
              src="/logo.avif"
              alt="John Doe"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="hidden text-left sm:block">
              <p className="text-[16px] font-semibold text-primary">John Doe</p>
            </div>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className="text-secondary"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
