"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export const EmptyState = () => {
  const router = useRouter();

  return (
    <>
      <section className="mx-auto flex min-h-[calc(100vh-140px)] max-w-[1100px] flex-col items-center justify-center px-5 pb-24 lg:px-6 lg:pb-0 lg:text-center">
        {/* Illustration */}
        <Image
          src="/emptystate.svg"
          alt="No assignments"
          width={300}
          height={300}
          priority
          className="h-[180px] w-[180px] drop-shadow-sm sm:h-[220px] sm:w-[220px] lg:h-[300px] lg:w-[300px]"
        />

        <div className="mt-8 w-full lg:flex lg:flex-col lg:items-center">
          <h2 className="text-[22px] font-semibold leading-tight text-primary text-center lg:text-[28px] lg:leading-[40px]">
            No assignments yet
          </h2>
          <p className="mt-3 text-[15px] leading-[1.6] text-secondary lg:max-w-[486px] text-center lg:text-[16px]">
            Create your first assignment to start collecting and grading student
            submissions. You can set up rubrics, define marking criteria, and
            let AI assist with grading.
          </p>
        </div>

        {/* Button — full width on mobile, auto on desktop */}
        <div className="mt-8 w-full lg:mt-10 lg:w-auto">
          <div className="rounded-full bg-gradient-to-b from-[#666666] to-[#2b2b2b] p-[1.5px]">
            <Button
              className="h-12 w-full rounded-full bg-[#1f1f1f] px-6 text-[15px] font-medium text-white lg:h-14 lg:w-auto lg:px-9 lg:text-[18px]"
              onClick={() => router.push("/assignments/create")}
              iconLeft={<Plus size={20} />}
            >
              Create Your First Assignment
            </Button>
          </div>
        </div>
      </section>

      {/* Floating + FAB — mobile only */}
      <button
        onClick={() => router.push("/assignments/create")}
        className="fixed bottom-20 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-transform active:scale-95 lg:hidden"
        aria-label="Create assignment"
      >
        <Plus size={24} className="text-primary" strokeWidth={2.5} />
      </button>
    </>
  );
};
