"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Image from "next/image";

export const EmptyState = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] select-none">
      <Image
        src="/emptystate.svg"
        alt="No assignments"
        width={220}
        height={220}
        priority
        draggable={false}
      />

      <h2 className="text-[16px] font-semibold text-[#111111] mt-5 mb-2">
        No assignments yet
      </h2>

      <p className="text-[13px] text-[#6B6B6B] text-center max-w-[300px] leading-relaxed mb-7">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>

      <button
        onClick={() => router.push("/assignments/create")}
        className="flex items-center gap-2 bg-[#1A1A1A] text-white text-[13px] font-semibold px-6 py-2.5 rounded-full hover:bg-[#2a2a2a] transition-colors"
      >
        <Plus size={14} strokeWidth={2.5} />
        Create Your First Assignment
      </button>
    </div>
  );
};
