"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export const EmptyState = () => {
  const router = useRouter();

  return (
    <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-[1100px] flex-col items-center justify-center px-6 text-center">
      <Image
        src="/Illustrations.svg"
        alt="No assignments"
        width={300}
        height={300}
        priority
        className="h-[220px] w-[220px] md:h-[260px] md:w-[260px] lg:h-[300px] lg:w-[300px]"
      />

      <h2 className="mt-10 text-[28px] font-semibold leading-[40px] text-primary">
        No assignments yet
      </h2>
      <p className="mt-3 max-w-[486px] text-[16px] leading-[1.45] text-secondary">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>

      <Button
        className="mt-10 h-16 rounded-full bg-[#1f1f1f] px-9 text-[18px] font-medium text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)] hover:bg-[#181818]"
        onClick={() => router.push("/assignments/create")}
        iconLeft={<Plus size={22} />}
      >
        Create Your First Assignment
      </Button>
    </section>
  );
};
