"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Eye, Trash2 } from "lucide-react";
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
    <article className="rounded-[20px] border border-border bg-white px-4 py-4 transition-shadow hover:shadow-md sm:px-5 sm:py-5">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-bold leading-snug text-primary ">
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
            <div className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
              <button
                onClick={() => {
                  onView(assignment._id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-3 text-left text-[14px] font-medium text-primary transition-colors hover:bg-surface-subtle"
              >
                View Assignment
              </button>
              <div className="mx-4 h-px bg-border" />
              <button
                onClick={() => {
                  onDelete(assignment._id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-3 text-left text-[14px] font-medium text-danger transition-colors hover:bg-rose-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dates row */}
      <div className="mt-6 flex items-center justify-between text-[13px] text-secondary">
        <span>
          <span className="font-semibold text-primary">Assigned on</span>
          {" : "}
          {formatAssignmentDate(assignment.createdAt)}
        </span>
        <span>
          <span className="font-semibold text-primary">Due</span>
          {" : "}
          {formatAssignmentDate(assignment.dueDate)}
        </span>
      </div>
    </article>
  );
};
