"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Settings } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }> | null;
  img: string | null;
};

const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: null, img: "/grid.svg" },
  {
    href: "/groups",
    label: "My Groups",
    icon: null,
    img: "/groups-vector.svg",
  },
  {
    href: "/assignments",
    label: "Assignments",
    icon: ClipboardList,
    img: null,
  },
  {
    href: "/toolkit",
    label: "AI Teacher's Toolkit",
    icon: null,
    img: "/book.svg",
  },
  { href: "/library", label: "My Library", icon: null, img: "/Icon.svg" },
];

const bottomNavItems = [
  { href: "/", label: "Home", img: "/grid.svg", icon: null },
  {
    href: "/assignments",
    label: "Assignments",
    icon: ClipboardList,
    img: null,
  },
  { href: "/library", label: "Library", img: "/book.svg", icon: null },
  { href: "/toolkit", label: "AI Toolkit", img: "/Icon.svg", icon: null },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop sidebar (completely untouched) ── */}
      <aside className="print-hidden fixed left-[var(--shell-pad)] top-[var(--shell-pad)] z-40 hidden h-[calc(100vh-(var(--shell-pad)*2))] w-[var(--sidebar-width)] flex-col justify-between rounded-2xl bg-surface px-6 py-6 shadow-[var(--shadow-card)] lg:flex">
        <div>
          <div className="mb-12 flex items-center gap-2 px-1">
            <Image
              src="/logo.avif"
              alt="VedaAI"
              width={40}
              height={40}
              priority
              className="h-10 w-10 object-contain"
            />
            <span className="text-[28px] font-bold leading-none tracking-tighter text-primary">
              VedaAI
            </span>
          </div>
          <Link
            href="/assignments/create"
            className="mb-12 flex h-12 items-center justify-center gap-2 rounded-full border-[4px] border-orange bg-[#2b2b2b] px-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors hover:bg-[#232323]"
          >
            <Image
              src="/Vector.png"
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
            <p className="font-[family-name:var(--font-inter)] text-sm font-thin">
              Create Assignment
            </p>
          </Link>
          <nav className="flex flex-col">
            {navLinks.map(({ href, label, icon: Icon, img }) => (
              <Link
                key={href}
                href={href}
                className={`flex h-12 items-center gap-3 rounded-2xl px-5 text-[16px] transition-colors ${
                  isActive(href)
                    ? "rounded-sm bg-surface-subtle font-semibold text-primary"
                    : "font-normal text-secondary hover:bg-surface-subtle hover:text-primary"
                }`}
              >
                {img ? (
                  <Image
                    src={img}
                    alt=""
                    width={18}
                    height={18}
                    className={`h-[18px] w-[18px] ${isActive(href) ? "opacity-100" : "opacity-50"}`}
                  />
                ) : Icon ? (
                  <Icon size={18} strokeWidth={isActive(href) ? 2.2 : 1.9} />
                ) : null}
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-2xl px-5 py-3 text-[16px] font-normal leading-[140%] tracking-[-0.04em] text-secondary transition-colors hover:bg-surface-subtle hover:text-primary font-[family-name:var(--font-inter)]"
          >
            <Settings size={18} strokeWidth={1.9} />
            Settings
          </Link>
          <div className="rounded-2xl bg-surface-subtle px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/Avatar.png"
                  alt="Delhi Public School"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold leading-snug text-primary">
                  Delhi Public School
                </p>
                <p className="truncate text-[12px] leading-snug text-secondary">
                  Bokaro Steel City
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom nav — blur backdrop + pill ── */}
      <div className="print-hidden fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        {/* Frosted blur layer */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/30 via-white/10 to-transparent backdrop-blur-sm" />
        {/* Pill */}
        <nav className="relative mx-3 mb-3 flex items-center justify-around rounded-[28px] bg-[#1a1a1a] px-2 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.28)]">
          {bottomNavItems.map(({ href, label, icon: Icon, img }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div className="flex h-8 w-8 items-center justify-center">
                  {img ? (
                    <Image
                      src={img}
                      alt=""
                      width={24}
                      height={24}
                      className={`h-6 w-6 brightness-0 invert ${active ? "opacity-100" : "opacity-40"}`}
                    />
                  ) : Icon ? (
                    <Icon
                      size={24}
                      strokeWidth={active ? 2.2 : 1.8}
                      className={active ? "text-white" : "text-white/40"}
                    />
                  ) : null}
                </div>
                <span
                  className={`text-[13px] font-normal ${active ? "text-white" : "text-white/40"}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};
