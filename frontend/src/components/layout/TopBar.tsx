"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, ChevronDown, ArrowLeft, LayoutGrid, Menu } from "lucide-react";

const getTitle = (pathname: string): string => {
  if (pathname === "/assignments") return "Assignments";
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
      {/* ── Mobile: brand bar (your existing code, untouched) ── */}
      <div className="mx-3 mt-3 flex h-14 items-center justify-between rounded-2xl bg-white px-4 shadow-[0_4px_24px_rgba(0,0,0,0.10)] lg:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.avif"
            alt="VedaAI"
            width={32}
            height={32}
            priority
            className="h-8 w-8 object-contain"
          />
          <span className="text-[20px] font-bold tracking-tighter text-primary">
            VedaAI
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-secondary">
            <Bell size={18} strokeWidth={2.2} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full">
            <Image
              src="/Avatar.png"
              alt="User"
              width={36}
              height={36}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-secondary">
            <Menu size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mx-3 mt-2 flex h-11 items-center rounded-2xl px-3 shadow-[0_4px_24px_rgba(0,0,0,0.07)] lg:hidden">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-primary"
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
        </button>
        {/* Centered title — negative margin to optically center against full width */}
        <p
          className="flex-1 text-center text-[15px] font-semibold text-primary"
          style={{ marginRight: "2rem" }}
        >
          {getTitle(pathname)}
        </p>
      </div>

      {/* ── Desktop topbar (your existing code, untouched) ── */}
      <div className="mx-auto hidden h-[var(--topbar-height)] items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/92 px-6 backdrop-blur lg:flex">
        <div className="flex min-w-0 items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-colors hover:text-primary"
            >
              <ArrowLeft size={16} strokeWidth={2} />
            </button>
          )}
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-9 w-9 items-center justify-center text-muted sm:flex">
              <LayoutGrid size={16} strokeWidth={1.8} />
            </div>
            <p className="truncate text-[16px] font-semibold text-secondary">
              {getTitle(pathname)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-colors hover:text-primary">
            <Bell size={19} strokeWidth={2.2} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange" />
          </button>
          <div className="flex items-center gap-3 rounded-full bg-white px-1 py-1">
            <Image
              src="/Avatar.png"
              alt="John Doe"
              width={36}
              height={36}
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="hidden text-left sm:block">
              <p className="text-[16px] font-semibold text-primary">John Doe</p>
            </div>
            <ChevronDown size={18} strokeWidth={3} className="text-secondary" />
          </div>
        </div>
      </div>
    </header>
  );
};
