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
  { href: "/library", label: "My Library", icon: null, img: "/icon.svg" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <aside className="print-hidden fixed left-[var(--shell-pad)] top-[var(--shell-pad)] z-40 hidden h-[calc(100vh-(var(--shell-pad)*2))] w-[var(--sidebar-width)] flex-col justify-between rounded-2xl bg-surface px-6 py-6 shadow-card lg:flex">
        {/* TOP SECTION */}
        <div>
          {/* Logo + VedaAI side by side */}
          <div className="mb-12 flex items-center gap-2 px-1">
            <Image
              src="/logo.avif"
              alt="VedaAI"
              width={40}
              height={40}
              priority
              className="h-10 w-10 object-contain"
            />
            <span className="tracking-tighter text-[28px] font-bold leading-none text-primary">
              VedaAI
            </span>
          </div>

          {/* Create Assignment Button */}
          <Link
            href="/assignments/create"
            className="mb-12 flex h-12 items-center justify-center gap-2 rounded-full border-[4px] border-orange bg-[#2b2b2b] px-4 text-[18px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors hover:bg-[#232323]"
          >
            <Image
              src="/Vector.png"
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
            <p className="font-[family-name:var(--font-inter)] font-thin text-sm">
              Create Assignment
            </p>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-col">
            {navLinks.map(({ href, label, icon: Icon, img }) => (
              <Link
                key={href}
                href={href}
                className={`flex h-12 items-center gap-3 rounded-2xl px-5 text-[16px] transition-colors ${
                  isActive(href)
                    ? "bg-surface-subtle font-semibold text-primary rounded-sm"
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

        {/* BOTTOM SECTION */}
        <div className="flex flex-col gap-2">
          <Link
            href="/settings"
            className="font-[family-name:var(--font-inter)] flex items-center gap-3 rounded-2xl px-5 py-3 text-[16px] font-normal tracking-[-0.04em] leading-[140%] text-secondary transition-colors hover:bg-surface-subtle hover:text-primary"
          >
            <Settings size={18} strokeWidth={1.9} />
            Settings
          </Link>

          <div className="rounded-2xl bg-surface-subtle px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ffd9cb] text-sm font-semibold text-orange">
                <Image
                  src="/Avatar.png"
                  alt="Delhi Public School"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
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

      {/* Mobile bottom nav */}
      <nav className="print-hidden fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full border border-border bg-white/95 px-3 py-2 shadow-card backdrop-blur lg:hidden">
        {navLinks.slice(0, 4).map(({ href, label, icon: Icon, img }) => (
          <Link
            key={href}
            href={href}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] ${
              isActive(href)
                ? "bg-surface-subtle font-semibold text-primary"
                : "text-muted"
            }`}
          >
            {img ? (
              <Image
                src={img}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4"
              />
            ) : Icon ? (
              <Icon size={16} />
            ) : null}
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};
