"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, Eye } from "lucide-react";
import { IAssignment } from "@/types/assignment.types";

interface Props {
  assignment: IAssignment;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export const AssignmentCard = ({ assignment, onDelete, onView }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB").replace(/\//g, "-");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 relative hover:border-[#D0D0D0] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#111111] leading-tight pr-4">
          {assignment.title}
        </h3>

        {/* Three dot menu */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((p) => !p)}
            className="text-[#9CA3AF] hover:text-[#6B6B6B] p-1 rounded transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {open && (
            <div className="absolute right-0 top-7 bg-white border border-[#E5E5E5] rounded-xl shadow-lg z-10 w-44 overflow-hidden">
              <button
                onClick={() => {
                  onView(assignment._id);
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#111111] hover:bg-[#F9F9F9] transition-colors"
              >
                <Eye size={14} />
                View Assignment
              </button>
              <button
                onClick={() => {
                  onDelete(assignment._id);
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
        <span>
          <span className="text-[#6B6B6B]">Assigned on :</span>{" "}
          {formatDate(assignment.createdAt)}
        </span>
        <span>
          <span className="text-[#6B6B6B]">Due :</span>{" "}
          {formatDate(assignment.dueDate)}
        </span>
      </div>
    </div>
  );
};
