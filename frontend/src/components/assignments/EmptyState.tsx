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
        className="h-[180px] w-[180px] drop-shadow-sm sm:h-[220px] sm:w-[220px] md:h-[260px] md:w-[260px] lg:h-[300px] lg:w-[300px]"
      />

      <h2 className="mt-10 text-[28px] font-semibold leading-[40px] text-primary">
        No assignments yet
      </h2>
      <p className="max-w-[486px] text-[16px] leading-[1.45] text-secondary">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>

      <div className="mt-6 sm:mt-8 md:mt-10 w-full sm:w-auto rounded-full bg-gradient-to-b from-[#666666] to-[#2b2b2b] p-[1.5px]">
        <Button
          className="h-12 w-full rounded-full bg-[#1f1f1f] px-6 text-[15px] font-medium text-white sm:h-14 sm:px-8 sm:text-[16px] md:h-14 md:px-9 md:text-[18px]"
          onClick={() => router.push("/assignments/create")}
          iconLeft={<Plus size={22} />}
        >
          Create Your First Assignment
        </Button>
      </div>
    </section>
  );
};
