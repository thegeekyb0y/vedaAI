"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ClipboardList,
  Wand2,
  Clock,
  Settings,
  Plus,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/groups", label: "My Groups", icon: Users },
  { href: "/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/toolkit", label: "AI Teacher's Toolkit", icon: Wand2 },
  { href: "/library", label: "My Library", icon: Clock },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="fixed left-0 top-0 h-screen w-(--sidebar-width) bg-(--color-surface) border-r border-(--color-border) flex flex-col px-3 py-4 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-5">
        <div className="w-8 h-8 rounded-(--radius-sm) bg-(--color-orange) flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
            <path
              d="M2 17L12 22L22 17"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text-[18px] font-bold tracking-tight text-(--color-primary)">
          VedaAI
        </span>
      </div>

      {/* Create Button */}
      <Link
        href="/assignments/create"
        className="flex items-center justify-center gap-2 bg-(--color-primary) text-white text-[13px] font-semibold rounded-(--radius-full) py-2.5 px-4 mb-6 hover:opacity-85 transition-opacity"
      >
        <Plus size={14} strokeWidth={2.5} />
        Create Assignment
      </Link>

      {/* Nav Links */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-(--radius-sm) text-[13px] transition-colors ${
              isActive(href)
                ? "bg-[#F5F5F5] text-(--color-primary) font-semibold"
                : "text-(--color-secondary) hover:bg-[#F5F5F5] hover:text-(--color-primary) font-medium"
            }`}
          >
            <Icon size={15} strokeWidth={isActive(href) ? 2.5 : 1.8} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-(--radius-sm) text-[13px] font-medium text-(--color-secondary) hover:bg-[#F5F5F5] hover:text-(--color-primary) transition-colors"
        >
          <Settings size={15} strokeWidth={1.8} />
          Settings
        </Link>

        <div className="flex items-center gap-2.5 p-2.5 mt-2 bg-[#FAFAFA] border border-(--color-border) rounded-(--radius-md)">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-[11px] font-bold text-(--color-orange)">
            DP
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-semibold text-(--color-primary) truncate leading-snug">
              Delhi Public School
            </span>
            <span className="text-[11px] text-(--color-muted) leading-snug">
              Bokaro Steel City
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
