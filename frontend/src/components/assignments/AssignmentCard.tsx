"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Eye, MoreVertical, RefreshCcw, Trash2 } from "lucide-react";
import { IAssignment } from "@/types/assignment.types";
import { formatAssignmentDate } from "@/features/assignments/utils";

interface Props {
  assignment: IAssignment;
  onDelete: (id: string) => void;
  onRegenerate?: (id: string) => void;
  onView: (id: string) => void;
}

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
} as const;

export const AssignmentCard = ({
  assignment,
  onDelete,
  onRegenerate,
  onView,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  return (
    <article className="rounded-[30px] border border-(--color-border) bg-white p-5 shadow-(--shadow-card) transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[assignment.status]}`}
          >
            {assignment.status}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-(--color-primary)">
              {assignment.title}
            </h3>
            <p className="mt-1 text-sm text-(--color-muted)">
              {assignment.questionTypes.length} question groups configured
            </p>
          </div>
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface-raised) text-(--color-secondary) transition-colors hover:text-(--color-primary)"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-12 z-10 w-48 rounded-3xl border border-(--color-border) bg-white p-2 shadow-(--shadow-card)">
              <button
                onClick={() => {
                  onView(assignment._id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-(--color-primary) transition-colors hover:bg-(--color-surface-subtle)"
              >
                <Eye size={15} />
                View Assignment
              </button>
              {onRegenerate ? (
                <button
                  onClick={() => {
                    onRegenerate(assignment._id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-(--color-primary) transition-colors hover:bg-(--color-surface-subtle)"
                >
                  <RefreshCcw size={15} />
                  Regenerate
                </button>
              ) : null}
              <button
                onClick={() => {
                  onDelete(assignment._id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-(--color-danger) transition-colors hover:bg-rose-50"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-[24px] bg-(--color-surface-raised) p-4 text-sm text-(--color-secondary) sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <CalendarDays size={16} className="text-(--color-muted)" />
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-(--color-muted)">
              Assigned
            </p>
            <p className="font-medium text-(--color-primary)">
              {formatAssignmentDate(assignment.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CalendarDays size={16} className="text-(--color-muted)" />
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-(--color-muted)">
              Due Date
            </p>
            <p className="font-medium text-(--color-primary)">
              {formatAssignmentDate(assignment.dueDate)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};
