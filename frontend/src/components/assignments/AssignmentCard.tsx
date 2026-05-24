"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, MoreVertical, Trash2 } from "lucide-react";
import { IAssignment } from "@/types/assignment.types";
import { formatAssignmentDate } from "@/features/assignments/utils";

interface Props {
  assignment: IAssignment;
  onDelete: (id: string) => void;
  onRegenerate?: (id: string) => void;
  onView: (id: string) => void;
}

export const AssignmentCard = ({ assignment, onDelete, onView }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <article className="rounded-[20px] border border-border bg-white px-5 py-5 transition-shadow hover:shadow-md">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold leading-snug text-primary">
          {assignment.title}
        </h3>

        <div className="relative shrink-0" ref={ref}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-subtle hover:text-primary"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-44 rounded-2xl border border-border bg-white py-1.5 shadow-lg">
              <button
                onClick={() => {
                  onView(assignment._id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-primary transition-colors hover:bg-surface-subtle"
              >
                <Eye size={14} />
                View Assignment
              </button>
              <button
                onClick={() => {
                  onDelete(assignment._id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-danger transition-colors hover:bg-rose-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dates row */}
      <div className="mt-8 flex items-center justify-between text-[13px] text-secondary">
        <span>
          <span className="font-medium text-primary">Assigned on</span>
          {" : "}
          {formatAssignmentDate(assignment.createdAt)}
        </span>
        <span>
          <span className="font-medium text-primary">Due</span>
          {" : "}
          {formatAssignmentDate(assignment.dueDate)}
        </span>
      </div>
    </article>
  );
};
